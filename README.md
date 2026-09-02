# Miroir — tests de personnalité

Application web mobile-first de tests de personnalité courts et fun,
pensée pour être jouée seule (et, à terme, à deux ou en groupe). Chaque
test génère un portrait narratif — jamais un score — et un petit
personnage illustré à collectionner.

> **Statut** : Phase 1 (parcours solo complet). Le mode Duo et le mode
> Soirée (local et à distance) décrits dans le brief ne sont pas encore
> implémentés — voir [Roadmap](#roadmap) plus bas.

## Concept

1. Depuis l'accueil, choisis une catégorie (Amour & relations, Amitié,
   Aventure & survie, Humour, Valeurs de vie, Rapport à l'argent, Travail
   & ambition, Culture) puis un test précis — filtrable par humeur
   (☀️ Léger / 🌊 Profond) — ou décris ton propre thème.
2. Réponds à 15 questions à choix multiples (4 à 6 options variées).
3. Ton portrait de personnalité s'affiche instantanément : quelques
   phrases chaleureuses et 4 traits de caractère, jamais un diagnostic.
4. Un personnage visuel généré par algorithme (forme, couleurs,
   expression, rareté, surnom) accompagne le portrait — le même résultat
   revisité affiche toujours le même personnage. Partage-le en image
   (Web Share API, avec repli en téléchargement).
5. Chaque test complété alimente ta série (streak) et débloque des
   badges, visibles dans ta collection (`/galerie`).

Aucune inscription n'est requise pour jouer : un compte anonyme est créé
automatiquement à la première visite (Supabase Auth). Depuis la galerie,
tu peux relier un email pour retrouver ta collection sur un autre
appareil.

## Stack technique

- **Next.js 16** (App Router, Server Actions, React 19), proxy Node.js
  (`proxy.ts`, ex-"middleware")
- **Supabase** : Postgres (schéma + RLS, voir `supabase/migrations/`),
  Auth (comptes anonymes + upgrade par email), et à terme Realtime +
  Storage pour le mode Soirée à distance (Phase 2)
- **Claude (API Anthropic)** pour générer à la volée les tests non
  pré-écrits et le portrait de chaque résultat (`lib/ai.ts`)
- CSS plain (pas de framework utilitaire) reproduisant fidèlement la
  palette et la typographie du prototype de référence (Fraunces + Inter,
  fond violine, accents citron/corail/menthe/violet)

## Démarrer en local

### 1. Base de données Supabase

Deux options :

**a. Un vrai projet Supabase** (recommandé si tu veux tester Auth de bout
en bout) :

```bash
# Sur https://supabase.com : crée un projet, récupère son URL et sa clé anon
npx supabase link --project-ref <ton-project-ref>
npx supabase db push          # applique supabase/migrations/
# Le contenu pré-écrit (supabase/seed.sql) n'est PAS appliqué automatiquement
# sur un projet distant : colle son contenu dans l'éditeur SQL du dashboard,
# ou exécute-le avec `psql` en pointant sur ta base distante.
```

Active aussi la connexion anonyme dans le dashboard : **Authentication →
Sign In / Providers → Anonymous Sign-Ins**.

**b. Supabase local via Docker** (si Docker est disponible sur ta
machine — ce n'était pas le cas dans l'environnement où ce projet a été
développé, voir [Limites de test](#limites-de-test-dans-cet-environnement)) :

```bash
npx supabase start   # démarre Postgres + Auth + Realtime + Storage en local
                      # applique automatiquement migrations + seed.sql
```

### 2. Variables d'environnement

```bash
cp .env.example .env
# Renseigne NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
# (affichées par `npx supabase start`, ou dans Project Settings > API
# sur le dashboard distant), et ANTHROPIC_API_KEY.
```

### 3. Lancer l'app

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

**Sans `ANTHROPIC_API_KEY`**, les 11 tests pré-écrits (voir
`lib/preseeded-tests.ts`) restent jouables de bout en bout : les questions
viennent de la base (aucun appel IA), et le portrait final retombe sur une
petite banque de portraits tout prêts (`lib/portrait-fallback.ts`) plutôt
que d'échouer — moins personnalisé (il ne tient pas compte des réponses
précises), mais ça permet de tester tout le parcours sans clé payante. Le
personnage visuel, lui, n'a jamais besoin d'IA (généré par algorithme,
voir `lib/character.ts`). Les tests du catalogue non pré-écrits et les
thèmes personnalisés nécessitent en revanche une clé pour générer leurs
questions.

## Scripts utiles

| Commande                                                | Description                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------------|
| `npm run dev`                                              | Serveur de développement                                            |
| `npm run build`                                             | Build de production                                                  |
| `npm run supabase:start` / `supabase:stop`                   | Instance Supabase locale (nécessite Docker)                         |
| `npm run supabase:reset`                                      | Réapplique migrations + seed sur la base locale                     |
| `node --experimental-strip-types scripts/generate-seed.ts`     | Régénère `supabase/seed.sql` depuis `lib/catalog.ts` + `lib/preseeded-tests.ts` |

## Architecture du code

```
app/
  page.tsx                    → accueil : grille de catégories
  categorie/[id]/page.tsx      → liste des tests de la catégorie, filtre humeur, thème libre
  test/[slug]/page.tsx          → charge/génère le test puis lance le quiz
  resultat/[id]/page.tsx         → portrait + personnage + partage
  galerie/page.tsx                → collection, badges, lien du compte
components/
  QuizRunner.tsx                    → parcours de questions pas-à-pas (client)
  ReactionPicker.tsx                 → réaction "ça te ressemble ?" sur son résultat
  ShareCharacterButton.tsx            → export du personnage en image (canvas + Web Share API)
  CustomThemeForm.tsx, LinkEmailForm.tsx → formulaires avec Server Actions
lib/
  ai.ts                                → génération IA (Claude) des questions et portraits
  catalog.ts                            → catégories + liste des tests proposés
  preseeded-tests.ts                     → contenu des 11 tests pré-écrits
  character.ts                            → génération procédurale déterministe du personnage
  badges.ts                                → catalogue des badges de progression
  actions.ts                                → Server Actions (cache/génération de test, soumission, réaction, lien email)
  data.ts                                    → lectures Supabase (profil, galerie, résultat, badges)
  supabase/{client,server}.ts                 → clients Supabase (browser / Server Components)
proxy.ts                                        → rafraîchit la session + connexion anonyme automatique
supabase/
  migrations/0001_init.sql                       → schéma (profiles, tests, results, badges, profile_badges) + RLS
  seed.sql                                          → généré par scripts/generate-seed.ts (badges + tests pré-écrits)
```

## Modèle de données (résumé)

- **profiles** : étend `auth.users` (créé automatiquement par trigger à
  l'inscription, y compris anonyme) — streak courant/record, date du
  dernier test, nombre de tests complétés.
- **tests** : catalogue (titre, catégorie, profondeur, 15 questions en
  JSON). Lecture publique ; écriture ouverte aux utilisateurs connectés
  (y compris anonymes) pour permettre la mise en cache d'un test généré
  à la volée — le premier joueur à choisir un test du catalogue sans
  contenu pré-écrit déclenche sa génération, les suivants le chargent
  instantanément depuis la base.
- **results** : un run complet d'un utilisateur (réponses, portrait, 4
  traits, réaction) — strictement privé au propriétaire (RLS). Le
  personnage visuel n'est **pas** stocké : il est recalculé à la volée à
  partir d'un seed déterministe (`id du résultat` + `slug du test`), ce
  qui garantit qu'il est toujours identique à la revisite sans dupliquer
  de données.
- **badges** / **profile_badges** : catalogue public + badges débloqués
  par utilisateur.

## Sécurité (RLS)

Chaque table sensible est protégée par des policies Postgres row-level
security, validées dans cet environnement contre une vraie instance
Postgres (voir plus bas) : un utilisateur ne peut lire ou modifier que
ses propres `results` et `profile_badges` ; le catalogue de tests et les
badges sont en lecture publique.

## Limites de test dans cet environnement

Docker n'était pas utilisable dans l'environnement où ce projet a été
développé (le démon ne peut pas démarrer), donc **`npx supabase start`
n'a pas pu être exécuté ici** — l'intégration complète avec Supabase Auth
et l'API REST n'a donc pas pu être testée en conditions réelles depuis
cette session.

Ce qui a néanmoins été vérifié :

- Le schéma (`supabase/migrations/0001_init.sql`) et `supabase/seed.sql`
  ont été appliqués avec succès sur une instance PostgreSQL 16 native
  (installée sans Docker), avec un schéma `auth` minimal reproduisant
  `auth.users`, `auth.uid()` et `auth.role()`.
- Les policies RLS ont été exercées avec de vraies transactions
  (`SET LOCAL request.jwt.claim.*` + `SET ROLE authenticated`/`anon`,
  comme le fait PostgREST) : un utilisateur ne voit ni ne peut modifier
  les résultats d'un autre, un rôle anonyme ne lit que le catalogue
  public, et le trigger de création de profil fonctionne.
- `npm run build`, `npm run lint` et `tsc --noEmit` passent sans erreur.
- L'app a été démarrée avec `next dev` : toutes les routes répondent
  (200/404 selon les cas) et se dégradent proprement (écran d'erreur
  géré, pas de crash serveur) quand Supabase est injoignable — utile
  pour juger du comportement, mais ce n'est pas un test du parcours réel.

**À faire avant mise en production** : connecter un vrai projet Supabase
(ou lancer `npx supabase start` sur une machine avec Docker) et rejouer
le parcours complet (création de compte anonyme, test pré-écrit, test
généré à la volée, portrait, partage, galerie, streak, badges, lien
d'email) en conditions réelles.

## Roadmap

Décrit dans le brief mais pas encore construit :

- **Mode Duo** (même téléphone, deux joueurs, révélation simultanée +
  compatibilité calculée par l'IA).
- **Mode Soirée** local (Action ou Vérité à plusieurs, même téléphone).
- **Mode Soirée à distance** (salons synchronisés en temps réel via
  Supabase Realtime, upload de preuves photo sur le palier Léger via
  Supabase Storage, questions personnalisées par salon).
- Monétisation freemium (tests "profonds" et mode Soirée à distance en
  premium, cosmétiques de personnage).
