# Miroir — tests de personnalité

Application web mobile-first de tests de personnalité courts et fun,
pensée pour être jouée seule (et, à terme, à deux ou en groupe). Chaque
test génère un portrait narratif — jamais un score — et un petit
personnage illustré à collectionner.

> **Statut** : Phase 1 (parcours solo) et Phase 2 (mode Duo, mode Soirée
> local, mode Soirée à distance) implémentées — voir [Roadmap](#roadmap)
> plus bas pour ce qu'il reste (monétisation).

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

### Modes multijoueur (Phase 2)

- **Mode Duo** (`/duo/[slug]`, même téléphone) : deux joueurs répondent
  au même test l'un après l'autre, portraits révélés simultanément, puis
  un pourcentage et un texte de compatibilité générés par l'IA (avec
  repli local sans clé API).
- **Mode Soirée** (`/soiree`, même téléphone) : Action ou Vérité à
  plusieurs, paliers ☀️ Léger / 🔥 Osé, tours passés à main levée sur
  l'appareil.
- **Mode Soirée à distance** (`/soiree-distance`, un appareil par
  joueur·se) : crée ou rejoins un salon via un code à 5 caractères,
  synchronisation en temps réel (Supabase Realtime), réponses texte pour
  Vérité, preuve photo **optionnelle et uniquement sur le palier Léger**
  (jamais demandée sur Osé, par choix de confidentialité), questions
  personnalisées propres à chaque salon.

## Stack technique

- **Next.js 16** (App Router, Server Actions, React 19), proxy Node.js
  (`proxy.ts`, ex-"middleware")
- **Supabase** : Postgres (schéma + RLS, voir `supabase/migrations/`),
  Auth (comptes anonymes + upgrade par email), Realtime (synchronisation
  des salons du mode Soirée à distance) et Storage (preuves photo,
  bucket privé `party-proofs`)
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
  page.tsx                    → accueil : grille de catégories + bannières Duo/Soirée
  categorie/[id]/page.tsx      → liste des tests de la catégorie, filtre humeur, thème libre, bascule mode Duo
  test/[slug]/page.tsx          → charge/génère le test puis lance le quiz (solo)
  duo/[slug]/page.tsx            → charge/génère le test puis lance le quiz à deux
  resultat/[id]/page.tsx           → portrait + personnage + partage
  galerie/page.tsx                  → collection, badges, lien du compte
  soiree/page.tsx                    → mode Soirée local (Action ou Vérité, même téléphone)
  soiree-distance/page.tsx            → créer/rejoindre un salon à distance
  salon/[code]/page.tsx                → salon à distance (lobby, tours, spectateur)
components/
  QuizRunner.tsx                          → parcours de questions pas-à-pas solo (client)
  DuoRunner.tsx                            → parcours à deux + révélation + compatibilité (client)
  PartyRunner.tsx                           → mode Soirée local (client)
  RemoteRoomRunner.tsx                       → mode Soirée à distance : sync Realtime, tours, preuves photo (client)
  ReactionPicker.tsx                          → réaction "ça te ressemble ?" sur son résultat
  ShareCharacterButton.tsx                     → export du personnage en image (canvas + Web Share API)
  CreateRoomForm.tsx, JoinRoomForm.tsx           → créer/rejoindre un salon à distance (Server Actions)
  CustomThemeForm.tsx, LinkEmailForm.tsx          → formulaires avec Server Actions
lib/
  ai.ts                                → génération IA (Claude) des questions, portraits et compatibilité Duo
  catalog.ts                            → catégories + liste des tests proposés
  preseeded-tests.ts                     → contenu des 11 tests pré-écrits
  character.ts                            → génération procédurale déterministe du personnage
  badges.ts                                → catalogue des badges de progression
  party-content.ts                          → banque Action/Vérité + génération de surnoms de salon
  actions.ts                                 → Server Actions (cache/génération de test, soumission, réaction, lien email, portrait/compat Duo)
  room-actions.ts                             → Server Actions (créer/rejoindre un salon à distance)
  data.ts                                      → lectures Supabase (profil, galerie, résultat, badges, contenu Action/Vérité)
  supabase/{client,server}.ts                   → clients Supabase (browser / Server Components)
proxy.ts                                        → rafraîchit la session + connexion anonyme automatique
supabase/
  migrations/0001_init.sql                       → schéma Phase 1 (profiles, tests, results, badges, profile_badges) + RLS
  migrations/0002_party.sql                        → schéma Phase 2 (rooms, players, turns, dare_truth_prompts, room_custom_prompts) + RLS + Storage
  migrations/0003_realtime.sql                      → active Realtime sur rooms/players/turns
  seed.sql                                          → généré par scripts/generate-seed.ts (badges + tests pré-écrits + prompts Action/Vérité)
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
- **rooms** : un salon Soirée à distance (code à 5 caractères, palier,
  statut, joueur·se dont c'est le tour). **players** : les participant·es
  d'un salon (nom, jetons de passe restants) — un utilisateur ne peut
  rejoindre un salon qu'une fois (`unique(room_id, user_id)`).
  **turns** : historique des tours (type, palier, prompt, réponse texte
  ou chemin de preuve photo, statut). **room_custom_prompts** : questions
  personnalisées ajoutées par les joueur·ses, valables uniquement dans ce
  salon. **dare_truth_prompts** : banque publique de prompts Action/Vérité.
  L'appartenance à un salon est vérifiée via la fonction
  `is_room_member()` (`SECURITY DEFINER`) pour éviter la récursion RLS.
- **Storage** : bucket privé `party-proofs` pour les preuves photo du
  palier Léger — chaque fichier est scopé au salon (`storage.foldername()`)
  et lisible uniquement par ses membres via URL signée.

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

Même limite pour la Phase 2 (`0002_party.sql`, `0003_realtime.sql`) : le
schéma et ses policies RLS ont été validés de la même façon (Postgres
natif + transactions `SET LOCAL`). En revanche, la synchronisation
Realtime entre deux appareils, l'upload réel de preuve photo (Storage) et
la génération d'URL signée n'ont pas pu être testées de bout en bout ici
— seule la logique de mise à jour d'état local de `RemoteRoomRunner.tsx`
a été vérifiée (Playwright avec les appels réseau vers Supabase
simulés). À rejouer en conditions réelles avec deux appareils avant mise
en production.

## Roadmap

Décrit dans le brief mais pas encore construit :

- Monétisation freemium (tests "profonds" et mode Soirée à distance en
  premium, cosmétiques de personnage).
