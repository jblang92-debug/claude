// Génération à la demande de la description narrative de compatibilité
// (docs/architecture-app-rencontre.md §7). Appelée uniquement quand
// l'utilisateur ouvre l'écran de détail d'un match précis — jamais en
// avance pour tous les matchs possibles, et jamais depuis le batch
// nocturne/quotidien (voir 0002_matching_batch.sql, qui ne fait aucun
// appel LLM).
//
// Vérifie le cache `match_narratives` avant tout appel Claude : tant
// qu'aucun des deux profils n'a changé de version de personnalité, la
// même ligne est resservie.

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.123.0";
import { compareAxes, orderedPair, type PersonalityScores } from "../_shared/matching.ts";

const MODEL = Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-5";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Méthode non supportée" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Non authentifié" }, 401);
  }

  let candidateId: string;
  try {
    const body = await req.json();
    candidateId = body.candidateId;
    if (!candidateId) throw new Error("candidateId manquant");
  } catch {
    return json({ error: "Corps de requête invalide" }, 400);
  }

  // Client "utilisateur" (respecte la RLS) pour vérifier qui appelle et
  // que le candidat est bien un match légitime (suggestion du jour ou
  // match mutuel) — pas de vérification d'autorisation ad hoc ici, on
  // s'appuie sur les mêmes policies que le reste de l'app.
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: "Non authentifié" }, 401);
  }
  const callerId = userData.user.id;

  const { data: candidateProfile, error: candidateError } = await userClient
    .from("profiles")
    .select("id, personality_version, personality_scores, bio")
    .eq("id", candidateId)
    .maybeSingle();
  if (candidateError || !candidateProfile) {
    // La RLS ("profiles: select visible candidates") retourne 0 ligne si
    // ce candidat n'est pas un match légitime pour cet appelant.
    return json({ error: "Profil non accessible" }, 403);
  }

  const { data: callerProfile, error: callerError } = await userClient
    .from("profiles")
    .select("id, personality_version, personality_scores, bio")
    .eq("id", callerId)
    .maybeSingle();
  if (callerError || !callerProfile) {
    return json({ error: "Profil introuvable" }, 404);
  }

  const [lowId, highId] = orderedPair(callerId, candidateId);
  const low = lowId === callerId ? callerProfile : candidateProfile;
  const high = lowId === callerId ? candidateProfile : callerProfile;

  // Client "service" uniquement pour lire/écrire le cache partagé
  // match_narratives (la RLS le limite en lecture aux deux profils
  // concernés, mais l'écriture du cache n'est pas un droit qu'on veut
  // donner à un utilisateur classique).
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: cached } = await serviceClient
    .from("match_narratives")
    .select("narrative_text, axes_snapshot, model_used, generated_at")
    .eq("profile_low_id", lowId)
    .eq("profile_high_id", highId)
    .eq("version_low", low.personality_version)
    .eq("version_high", high.personality_version)
    .maybeSingle();

  if (cached) {
    return json({
      narrativeText: cached.narrative_text,
      axesSnapshot: cached.axes_snapshot,
      cached: true,
    });
  }

  const axesSnapshot = compareAxes(
    low.personality_scores as PersonalityScores,
    high.personality_scores as PersonalityScores,
  );

  const narrativeText = await generateNarrative(
    low.bio ?? "",
    high.bio ?? "",
    axesSnapshot,
  );

  const { error: insertError } = await serviceClient
    .from("match_narratives")
    .insert({
      profile_low_id: lowId,
      profile_high_id: highId,
      version_low: low.personality_version,
      version_high: high.personality_version,
      narrative_text: narrativeText,
      axes_snapshot: axesSnapshot,
      model_used: MODEL,
    });
  if (insertError) {
    // Une insertion concurrente a pu gagner la course (contrainte
    // unique) : ce n'est pas une erreur, l'appel suivant lira le cache.
    console.error("Écriture du cache match_narratives échouée", insertError);
  }

  return json({ narrativeText, axesSnapshot, cached: false });
});

async function generateNarrative(
  bioA: string,
  bioB: string,
  axesSnapshot: ReturnType<typeof compareAxes>,
): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    // Repli sans clé API : permet de tester le parcours de bout en bout
    // sans dépense — même logique que lib/portrait-fallback.ts côté app
    // de tests.
    return "Vous avez des styles de vie assez proches sur plusieurs points, avec quelques différences qui pourraient pimenter les choses plutôt que les compliquer.";
  }

  const client = new Anthropic({ apiKey });

  const axesText = axesSnapshot
    .map((a) => `${a.axis} : profil A = ${a.scoreA.toFixed(2)}, profil B = ${a.scoreB.toFixed(2)}`)
    .join("\n");

  const schema = {
    type: "object" as const,
    properties: {
      narrative_text: {
        type: "string",
        description:
          "2 à 4 phrases décrivant la dynamique probable entre les deux profils : ce qui les rapproche et ce qui pourrait créer des frictions. Jamais de pourcentage ni de score. Ton bienveillant, jamais blessant. En français, tutoiement.",
      },
    },
    required: ["narrative_text"],
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system:
      "Tu décris la dynamique probable entre deux profils de personnalité pour une app de rencontre, à partir de leurs positions sur plusieurs axes. Jamais de score global ni de pourcentage. Ton chaleureux et honnête, y compris pour pointer des frictions potentielles, jamais blessant ni moralisateur.",
    messages: [
      {
        role: "user",
        content: `Positions sur les axes de personnalité :\n${axesText}\n\nBio du profil A : ${bioA || "(non renseignée)"}\nBio du profil B : ${bioB || "(non renseignée)"}\n\nDécris la dynamique probable entre ces deux personnes.`,
      },
    ],
    tools: [
      {
        name: "submit_narrative",
        description: "Envoie la description narrative de compatibilité",
        input_schema: schema,
      },
    ],
    tool_choice: { type: "tool", name: "submit_narrative" },
  });

  const toolUse = message.content.find(
    (c): c is Anthropic.ToolUseBlock => c.type === "tool_use",
  );
  if (!toolUse) throw new Error("Aucune réponse structurée reçue de l'IA");

  const data = toolUse.input as { narrative_text: string };
  if (!data.narrative_text) throw new Error("Narrative IA incomplète");
  return data.narrative_text;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
