# Miroir Rencontre

App mobile de rencontre (React Native / Expo), pivot du produit Miroir
qui garde son moteur de personnalité comme cœur du matching. Projet
**séparé** de l'app web de tests de personnalité à la racine de ce
dépôt (non modifiée) — voir `../docs/architecture-app-rencontre.md`
pour le document de cadrage complet.

> **Statut** : scaffold initial — socle technique, schéma Supabase
> complet, pipeline de matching par batch, questionnaire de
> personnalité et parcours d'inscription/suggestion/chat de bout en
> bout. Pas encore testé en conditions réelles (voir
> [Limites de test](#limites-de-test-dans-cet-environnement)).

## Positionnement

"On ne matche pas sur une photo, on matche sur qui tu es vraiment." Le
questionnaire de personnalité est le point d'entrée obligatoire à
l'inscription. Le matching ne montre jamais de pourcentage de
compatibilité : une description narrative courte (générée par Claude,
à la demande, avec cache) et une visualisation en constellation
multi-axes.

## Stack technique

- **Expo (React Native)**, TypeScript, `expo-router` (navigation par
  fichiers)
- **Supabase** : Postgres + RLS, Auth (email — pas de compte anonyme,
  contrairement à l'app de tests), Realtime (chat), Storage (photos de
  profil + selfies de vérification), `pg_cron` (batch)
- **Claude (API Anthropic)**, appelé uniquement depuis une fonction
  Edge Supabase (`supabase/functions/match-narrative`), jamais depuis
  l'app — génère la description narrative de compatibilité à la
  demande, avec repli sans clé API pour tester sans dépense
- TanStack Query pour l'état serveur, `react-native-svg` pour la
  constellation

## Pourquoi un projet Supabase séparé ?

Les données de rencontre (personnalité, vérification d'identité,
messages) sont plus sensibles et soumises à des contraintes RGPD et de
modération différentes de celles de l'app de tests — les séparer évite
un couplage RLS/schéma entre deux produits qui n'ont plus vocation à
partager un compte utilisateur.

## Démarrer en local

### 1. Base de données Supabase

```bash
# Un vrai projet Supabase (recommandé) :
npx supabase link --project-ref <ton-project-ref>
npx supabase db push

# Ou en local avec Docker (non disponible dans l'environnement où ce
# scaffold a été développé, voir plus bas) :
npx supabase start   # applique automatiquement migrations/ + seed.sql
```

Active la connexion par email dans le dashboard (**Authentication →
Providers**) — pas de connexion anonyme pour ce produit.

### 2. Fonction Edge (narrative de compatibilité)

```bash
npx supabase functions deploy match-narrative
npx supabase secrets set ANTHROPIC_API_KEY=sk-... ANTHROPIC_MODEL=claude-sonnet-5
```

Sans `ANTHROPIC_API_KEY`, la fonction reste appelable et retombe sur un
texte générique (voir `supabase/functions/match-narrative/index.ts`) —
utile pour tester le parcours sans clé payante, comme pour l'app de
tests.

### 3. Variables d'environnement de l'app

```bash
cp .env.example .env
# Renseigne EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Lancer l'app

```bash
npm install
npm run start   # puis 'i' (iOS), 'a' (Android) ou 'w' (web, pour prototyper vite)
```

## Architecture du code

```
app/
  index.tsx                     → porte d'entrée : redirige selon session + étape d'onboarding
  (auth)/welcome, sign-up, sign-in.tsx
  (onboarding)/consent.tsx        → CGU + RGPD + vérification d'âge 18+ (traçable)
  (onboarding)/selfie.tsx           → selfie de vérification (review manuelle)
  (onboarding)/quiz.tsx               → questionnaire de personnalité (21 questions)
  (app)/today.tsx                       → fil de suggestions du jour (3-5, batch quotidien)
  (app)/match/[id].tsx                    → narrative + constellation + like/pass + double opt-in
  (app)/chats/index.tsx, chats/[id].tsx     → conversations (Realtime), blocage/signalement
  (app)/profile.tsx                           → profil, vecteur de personnalité, déconnexion
lib/
  matching/axes.ts                    → catalogue des 7 axes de personnalité
  matching/questionnaire.ts             → questions + poids par option
  matching/scoring.ts                     → scoring déterministe (aucun appel IA)
  matching/similarity.ts                    → comparaison de vecteurs (batch, constellation)
  supabase/client.ts                          → client Supabase (RN + AsyncStorage)
  auth.tsx, onboarding-status.ts                → session + étape d'inscription courante
components/
  Constellation.tsx                              → visualisation radar SVG (jamais un %)
supabase/
  migrations/0001_init.sql                         → schéma complet + RLS (voir résumé plus bas)
  migrations/0002_matching_batch.sql                 → recompute_profiles() + generate_daily_matches() + pg_cron
  migrations/0003_storage.sql                          → buckets photos/selfies + policies
  functions/match-narrative/                             → génération narrative à la demande + cache
```

## Modèle de données (résumé)

Voir `../docs/architecture-app-rencontre.md` §4 pour le détail complet.
En bref : `profiles` (vecteur de personnalité dénormalisé pour le
batch) + `personality_vectors` (historique versionné) +
`onboarding_responses` + `daily_matches`/`decisions`/`mutual_likes`
(suggestions et likes) + `match_narratives` (cache narrative+axes) +
`match_consents`/`conversations`/`messages` (double opt-in obligatoire)
+ `blocks`/`reports`/`verifications`/`consents` (sécurité et
conformité).

## Pipeline de matching (aucun appel IA en batch)

- `recompute_profiles()` (nocturne, `pg_cron`) : no-op au MVP, prêt pour
  l'affinement comportemental (v2).
- `generate_daily_matches()` (matin, `pg_cron`) : 3 à 5 suggestions par
  utilisateur actif et vérifié, filtrées (ville, genre recherché
  réciproque, écart d'âge) et classées par écart de personnalité —
  entièrement en SQL, aucun appel LLM.
- La description narrative (Claude, `match-narrative`) ne se déclenche
  qu'à la consultation d'un match précis, avec cache
  (`match_narratives`) tant qu'aucun des deux profils n'a changé de
  version.

## Sécurité et conformité

- RLS sur toutes les tables sensibles ; RPC `SECURITY DEFINER`
  (`record_match_consent`, `set_personality_vector`) pour les écritures
  multi-tables qui doivent rester atomiques.
- Double opt-in obligatoire avant tout chat (voir
  `record_match_consent` dans `0001_init.sql`).
- Blocage/signalement accessibles depuis toute conversation
  (`app/(app)/chats/[id].tsx`).
- Vérification d'âge 18+ auto-approuvée mais tracée (table
  `verifications`), selfie de vérification en review manuelle.
- **TODO durcissement avant production**, notés en commentaire dans les
  migrations : restreindre `profiles: select visible candidates` aux
  colonnes non sensibles (vue dédiée plutôt qu'accès ligne entière), et
  revalider `moderation_status` des messages côté serveur plutôt que de
  faire confiance au client.

## Limites de test dans cet environnement

Comme pour l'app de tests à la racine de ce dépôt, Docker n'était pas
utilisable dans l'environnement où ce scaffold a été développé (le
daemon ne démarre pas), donc `npx supabase start` n'a pas pu être
exécuté — l'app n'a donc pas pu être lancée sur un simulateur/appareil
ni testée de bout en bout contre une vraie API Supabase (PostgREST,
Realtime, Storage). Ce qui a néanmoins été vérifié :

- `npm install` et `npx tsc --noEmit` passent sans erreur sur l'app
  (les fonctions Edge, en Deno, sont exclues du `tsconfig.json` de
  l'app — leur environnement de types est différent).
- **Les migrations (`0001_init.sql`, `0002_matching_batch.sql`,
  `0003_storage.sql`) ont été appliquées avec succès sur une instance
  PostgreSQL 16 native** (installée sans Docker, `pg_cron` mis de côté
  pour ce test car non installable ici — la syntaxe des deux
  `cron.schedule(...)` reste à valider sur un vrai projet Supabase),
  avec un schéma `auth`/`storage` minimal reproduisant `auth.uid()`,
  `auth.role()` et `storage.foldername()`.
- Le parcours a été rejoué avec de vraies transactions (`SET LOCAL
  request.jwt.claim.sub` + `SET ROLE authenticated`, comme le fait
  PostgREST) : création automatique du profil à l'inscription,
  `set_personality_vector()`, `generate_daily_matches()` (suggestions
  correctement générées entre deux profils compatibles), visibilité
  RLS d'un profil suggéré, `handle_new_decision()` → `mutual_likes`,
  double opt-in via `record_match_consent()` (renvoie `null` tant que
  l'autre n'a pas consenti, l'id de conversation une fois les deux
  consentements réunis), lecture/écriture de messages restreinte aux
  membres, opacité totale pour un tiers.
- **Un vrai bug RLS a été détecté et corrigé pendant ce test** : la
  policy d'insertion de `messages` vérifiait un blocage via une
  sous-requête directe sur `blocks`, qui est elle-même filtrée par RLS
  ("chacun ne voit que les blocages qu'il a posés") — la personne
  bloquée ne pouvait donc jamais "voir" qu'elle l'était, et le blocage
  n'avait aucun effet. Corrigé avec une fonction `SECURITY DEFINER`
  dédiée (`conversation_is_blocked()`), sur le modèle de
  `is_conversation_member()`. Reproduit avec le blocage effectif après
  correction (l'insertion est bien rejetée par RLS).
- La fonction Edge `match-narrative` n'a en revanche pas pu être
  testée (runtime Deno local + appel réseau à l'API Anthropic).

**À faire avant de continuer le développement** : lancer
`npx supabase start` (ou lier un vrai projet, où `pg_cron` est
disponible) sur une machine avec Docker, déployer la fonction Edge, et
rejouer le parcours complet (inscription, consentement, selfie,
questionnaire, suggestions, narrative, double opt-in, chat,
blocage/signalement) sur l'app mobile elle-même plutôt qu'en SQL direct.

## Roadmap

Voir `../docs/architecture-app-rencontre.md` §12 pour les points encore
ouverts (emplacement définitif du projet, ajustement du barème du
questionnaire) et le brief initial pour la liste complète des
fonctionnalités reportées en v2 (matching par résonance, appels
audio/vidéo, achats intégrés, vérification d'identité poussée,
affinement comportemental continu).
