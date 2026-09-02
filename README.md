# Facette — tests de personnalité à partager

Application web mobile-first pour créer des tests de personnalité courts et
fun, les partager via un simple lien, et découvrir instantanément le portrait
de la personne qui répond — sans compte obligatoire, sans dépendance à un
service tiers pour l'essentiel du parcours.

## Concept

1. Un·e créateur·ice choisit un thème (ou en décrit un sur mesure) sur la
   page d'accueil.
2. L'app génère un test de 15 à 25 questions à choix multiple, sur un ton
   léger et bienveillant, et fournit un lien unique à partager (SMS,
   WhatsApp, copier-coller...).
3. La personne qui reçoit le lien répond en quelques minutes, sans créer de
   compte.
4. Dès la validation, un portrait de personnalité **narratif** (pas un
   simple score) s'affiche instantanément :
   - au répondant, directement dans l'app ;
   - au créateur, via un lien de résultat partageable, ou depuis son
     historique (`/mes-tests`), identifié anonymement par un cookie.

## Stack technique

- **Next.js 16** (App Router, Server Actions, React 19)
- **Tailwind CSS v4** pour le style, mobile-first
- **Prisma 7** + **SQLite** (via l'adaptateur `@prisma/adapter-better-sqlite3`)
  pour la persistance (tests, questions, réponses, portraits)
- **Claude (API Anthropic)** pour générer dynamiquement les questions et les
  portraits, avec repli automatique sur une banque de contenu pré-écrite
  quand aucune clé API n'est configurée (l'app reste donc pleinement
  fonctionnelle sans IA, pratique pour développer/tester hors-ligne)

## Démarrer en local

```bash
npm install
cp .env.example .env
npx prisma migrate deploy   # crée la base SQLite locale
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Sans `ANTHROPIC_API_KEY` renseignée dans `.env`, l'app fonctionne quand même
en mode "template" : les tests et les portraits utilisent une banque de
contenu prête à l'emploi (`lib/question-bank.ts`, `lib/portrait-bank.ts`)
au lieu d'un appel IA. Ajoute une clé pour activer la génération dynamique
par Claude (`lib/ai.ts`).

## Scripts utiles

| Commande              | Description                                                  |
| ---------------------- | -------------------------------------------------------------|
| `npm run dev`           | Lance le serveur de développement                            |
| `npm run build`         | Build de production (applique aussi les migrations Prisma)   |
| `npm run start`         | Démarre le build de production                                |
| `npm run db:migrate`    | Crée/applique une migration Prisma en dev                    |
| `npm run db:studio`     | Ouvre Prisma Studio pour explorer les données                |

## Architecture du code

```
app/
  page.tsx                 → accueil : choix du thème + création du test
  test/[slug]/page.tsx      → page du créateur : lien à partager + réponses reçues
  t/[slug]/page.tsx         → parcours de réponse (public, sans compte)
  r/[slug]/page.tsx         → page de résultat (portrait), partageable
  mes-tests/page.tsx        → historique des tests créés (via cookie créateur)
components/
  CreateQuizForm.tsx        → formulaire de création (Server Action)
  QuizRunner.tsx             → parcours de questions pas-à-pas (client)
  ShareLink.tsx               → copier / partager un lien (Web Share API)
  TraitBars.tsx                → visualisation du profil (barres de traits)
lib/
  ai.ts                        → génération IA (Claude) + repli "template"
  themes.ts                    → les 9 thèmes proposés et leurs traits
  question-bank.ts             → banque de questions prêtes à l'emploi
  portrait-bank.ts             → banque de portraits narratifs prêts à l'emploi
  scoring.ts                    → calcul du profil (répartition des traits) à partir des réponses
  actions.ts                    → Server Actions : createQuiz, submitResponse
  creator.ts                    → identité anonyme du créateur (cookie, sans compte)
  db.ts                          → client Prisma (SQLite + adaptateur)
prisma/
  schema.prisma                  → modèles Quiz, Question, Response, Answer, Result, Creator
```

## Modèle de données (résumé)

- **Quiz** : thème, titre, intro, emoji, 4 traits mesurés, questions liées,
  rattaché à un `Creator` anonyme.
- **Question** : texte + 4 options, chacune reliée à l'un des 4 traits du
  quiz.
- **Response** : une session de réponse d'un destinataire (nom optionnel),
  liée à un `Quiz` et à un `Result`.
- **Result** : le portrait généré (titre, texte narratif, émoji, répartition
  des traits en %).

Le calcul du profil (`lib/scoring.ts`) est déterministe : chaque réponse
"vote" pour le trait de l'option choisie, ce qui garantit que les
pourcentages affichés sur la page de résultat correspondent exactement aux
réponses données, que le portrait soit généré par l'IA ou par le mode
template.

## Vie privée & identité du créateur

Aucun compte n'est requis, ni pour créer un test ni pour y répondre. Le
créateur est identifié de façon anonyme via un cookie longue durée
(`creator_id`), ce qui permet de retrouver l'historique de ses tests
(`/mes-tests`) depuis le même navigateur, sans inscription. La page de
gestion d'un test (`/test/[slug]`) n'affiche la liste des réponses reçues
qu'au créateur reconnu par ce cookie ; toute autre personne qui ouvrirait ce
lien est redirigée vers le parcours de réponse.

## Prochaines étapes (v2)

- **Envoi d'email transactionnel** (ex. Resend/SendGrid) pour notifier
  automatiquement le créateur quand une réponse arrive, et/ou envoyer le
  résultat au répondant — actuellement le partage se fait uniquement via le
  lien in-app, comme demandé en priorité.
- Authentification optionnelle pour un historique multi-appareils (le cookie
  anonyme actuel est local au navigateur).
- Questions de type "curseur" (le modèle de données prévoit déjà un champ
  `type` sur `Question` pour cette extension).

## Déploiement en production

Le script `build` exécute `prisma migrate deploy` (non destructif) avant de
builder l'app — pense à définir `DATABASE_URL` vers une base persistante
(un fichier SQLite ne survit pas à un déploiement serverless sans disque
persistant : pour une prod sérieuse, migre vers Postgres en adaptant
`prisma/schema.prisma` et l'adaptateur dans `lib/db.ts`, par exemple avec
`@prisma/adapter-pg`).
