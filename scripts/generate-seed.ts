// Génère supabase/seed.sql à partir du contenu défini en code
// (lib/catalog.ts, lib/preseeded-tests.ts, lib/badges.ts), pour que le
// catalogue et les tests pré-écrits soient chargés dans la base au premier
// `supabase db reset` / déploiement, sans jamais dupliquer ce contenu à la
// main en SQL.
//
// Usage : node --experimental-strip-types scripts/generate-seed.ts

import { writeFileSync } from "node:fs";
import { findQuizCategory, slugify, type Depth } from "../lib/catalog.ts";
import { PRESEEDED_TESTS } from "../lib/preseeded-tests.ts";
import { BADGES } from "../lib/badges.ts";

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

// Chaîne délimitée par $json$...$json$ (dollar-quoting Postgres) plutôt que
// par des guillemets simples : aucune séquence à échapper à l'intérieur, ce
// qui évite toute corruption lors d'un copier-coller manuel (mobile en
// particulier) et garde le JSON lisible sur plusieurs lignes courtes.
function sqlJsonbDollar(value: unknown): string {
  return `$json$${JSON.stringify(value, null, 2)}$json$::jsonb`;
}

const lines: string[] = [
  "-- Fichier généré automatiquement par scripts/generate-seed.ts — ne pas éditer à la main.",
  "-- Régénérer avec : node --experimental-strip-types scripts/generate-seed.ts",
  "",
  "-- Badges de progression",
  "insert into public.badges (id, threshold, label, emoji, sort_order) values",
];

lines.push(
  BADGES.map(
    (b, i) =>
      `  (${sqlString(b.id)}, ${b.threshold}, ${sqlString(b.label)}, ${sqlString(b.emoji)}, ${i})`,
  ).join(",\n") + "\non conflict (id) do nothing;",
);

lines.push("", "-- Tests pré-écrits (chargement instantané, aucun appel IA)");
lines.push("-- Un INSERT par test (au lieu d'un seul gros INSERT multi-lignes) : plus");
lines.push("-- facile à copier-coller/relancer par petits morceaux si besoin.");

let count = 0;
for (const [title, questions] of Object.entries(PRESEEDED_TESTS)) {
  const category = findQuizCategory(title);
  const quiz = category?.quizzes.find((q) => q.title === title);
  const depth: Depth = quiz?.depth ?? "leger";
  const slug = slugify(title);
  count++;
  lines.push(
    "",
    `-- ${count}. ${title}`,
    "insert into public.tests (slug, category_id, title, depth, emoji, is_premium, is_custom, questions)",
    "values (",
    `  ${sqlString(slug)},`,
    `  ${category ? sqlString(category.id) : "null"},`,
    `  ${sqlString(title)},`,
    `  ${sqlString(depth)},`,
    `  ${category ? sqlString(category.emoji) : "null"},`,
    `  false,`,
    `  false,`,
    `  ${sqlJsonbDollar(questions)}`,
    ")",
    "on conflict (slug) do nothing;",
  );
}
lines.push("");

const outPath = new URL("../supabase/seed.sql", import.meta.url);
writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`Écrit : ${outPath.pathname} (${count} tests pré-écrits, ${BADGES.length} badges)`);

// Vérifie que chaque test pré-écrit a bien 15 questions et 4-6 options chacune.
for (const [title, questions] of Object.entries(PRESEEDED_TESTS)) {
  if (questions.length !== 15) {
    console.warn(`⚠️  "${title}" a ${questions.length} questions (attendu : 15)`);
  }
  for (const q of questions) {
    if (q.options.length < 4 || q.options.length > 6) {
      console.warn(`⚠️  "${title}" — question "${q.q}" a ${q.options.length} options (attendu : 4 à 6)`);
    }
  }
}
