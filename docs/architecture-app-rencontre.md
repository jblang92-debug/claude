# Architecture technique — pivot rencontre de Miroir

> Document de cadrage avant implémentation. Ne modifie rien à l'app
> existante (`app/`, `lib/`, `components/`, `supabase/` à la racine) :
> celle-ci reste le produit "tests de personnalité" tel quel. Le pivot
> rencontre est un **nouveau projet**, décrit ici, qui réutilise des
> *idées* et parfois du code copié (pas importé) depuis l'existant.

## 1. Décisions de cadrage (validées avec toi)

- **Stack cible : React Native (Expo)**, app mobile native iOS/Android —
  pas de PWA. Raison : swipe/gestes, notifications push, caméra
  (selfie de vérification) et présence en arrière-plan sont nettement
  meilleurs en natif, et c'est cohérent avec une app de rencontre
  destinée aux stores dès le MVP.
- **Nouveau projet**, séparé de l'app Next.js existante. Proposition :
  un nouveau dossier `mobile/` à la racine de ce dépôt (monorepo léger),
  avec son propre `package.json`, pour garder tout l'historique et le
  contexte du projet au même endroit sans toucher au code Next.js. Si
  tu préfères un dépôt Git totalement séparé, dis-le-moi avant qu'on
  scaffold quoi que ce soit — c'est un choix réversible facilement à ce
  stade, plus coûteux à changer une fois le code écrit.
- **Backend : nouveau projet Supabase dédié** (pas le même que celui de
  l'app de tests). Les données de rencontre (personnalité + géoloc +
  photos de vérification + messages) sont plus sensibles et soumises à
  des contraintes RGPD différentes (âge, modération, droit à l'oubli) ;
  les séparer évite un couplage RLS/schema entre deux produits qui n'ont
  plus vocation à partager un compte utilisateur.
- **Compte anonyme abandonné pour ce produit** : une app de rencontre
  nécessite un email, une vérification d'âge et une photo dès
  l'inscription — le pattern "compte anonyme puis upgrade" de l'app de
  tests ne s'applique pas ici.

## 2. Ce qu'on réutilise de l'existant (copié, pas importé)

| Élément existant | Ce qu'on en reprend |
|---|---|
| `lib/character.ts` (génération procédurale déterministe) | Le *principe* : calculer les traits par une fonction déterministe plutôt que par appel IA à chaque fois — appliqué au scoring du questionnaire de personnalité (voir §5). |
| `lib/ai.ts` (`generateCompatibility`, appels Claude en tool-use structuré) | Le *pattern* d'appel : schéma JSON strict via tool-use, fallback sans clé API — réutilisé pour la génération de la description narrative de compatibilité (§7). |
| `supabase/migrations/*` (RLS, trigger `handle_new_user`, fonctions `SECURITY DEFINER` pour éviter la récursion RLS) | Le *pattern* RLS et l'usage de RPC `SECURITY DEFINER` pour les écritures multi-tables sensibles (ex. double opt-in, création de conversation). |
| Moteur de questionnaire (15 questions, options variées) | La mécanique d'onboarding, adaptée en un questionnaire orienté rencontre (probablement plus long/riche qu'un test ludique, car il initialise tout le profil de matching). |

Rien de ce code n'est modifié dans l'app existante ; il sert de
référence pour écrire des équivalents propres au nouveau projet.

## 3. Stack détaillée du nouveau projet mobile

- **Expo (managed workflow)**, TypeScript, `expo-router` pour la
  navigation par fichiers (cohérent avec l'App Router déjà connu côté
  Next.js).
- **Supabase** : `@supabase/supabase-js` (le SDK JS fonctionne tel quel
  en React Native), Postgres + RLS, Auth (email + mot de passe ou OTP —
  pas d'anonyme), Realtime (chat), Storage (photos de profil + selfie de
  vérification, buckets privés).
- **État serveur** : TanStack Query (cache des suggestions du jour, des
  conversations) plutôt que du state global maison.
- **Caméra / média** : `expo-image-picker` + `expo-camera` (selfie de
  vérification, photos de profil).
- **Notifications** : `expo-notifications` (nouveau match, nouveau
  message) — tokens stockés dans une table `push_tokens`.
- **Localisation** : `expo-location`, mais à la **granularité ville**
  uniquement (pas de coordonnées précises stockées) — c'est suffisant
  pour filtrer les suggestions par distance et réduit la sensibilité des
  données stockées.
- **Jobs batch** : Supabase Edge Functions (Deno) déclenchées par
  `pg_cron`, plutôt qu'un serveur Node séparé à maintenir — deux
  fonctions : recalcul de profils (nocturne) et génération des
  suggestions (matin). Voir §6.
- **LLM** : `@anthropic-ai/sdk`, appelé uniquement depuis les Edge
  Functions / Server Actions équivalentes, jamais depuis le client.

## 4. Modèle de données (nouveau projet Supabase)

Vue d'ensemble des tables (RLS activée partout, détail des policies à
écrire au moment des migrations, pas dans ce document) :

### Identité et profil

- **`profiles`** — étend `auth.users` : `id`, `display_name`,
  `birthdate`, `gender`, `seeking` (préférences), `bio`, `city`,
  `photos` (jsonb, chemins Storage), `onboarding_completed_at`,
  `created_at`.
- **`verifications`** — `user_id`, `type` (`email` | `selfie` | `age`),
  `status` (`pending` | `approved` | `rejected`), `evidence_path`
  (Storage, selfie), `reviewed_by`, `reviewed_at`, `created_at`. Table
  d'audit : jamais de update destructif, on insère une nouvelle ligne à
  chaque tentative — traçabilité de la vérification d'âge exigée par le
  brief.
- **`consents`** — `user_id`, `type` (CGU, traitement données
  sensibles RGPD, notifications), `version`, `accepted_at`. Nécessaire
  pour documenter le consentement explicite au traitement de données de
  personnalité (données sensibles au sens RGPD).

### Personnalité et matching

- **`trait_axes`** (catalogue, lecture publique) — `key` (ex.
  `humour`, `energie`, `valeurs`, `ambition`, `attachement`),
  `label_pole_a`, `label_pole_b`, `description`. Définit les axes
  utilisés par la visualisation constellation — catalogue versionné
  pour pouvoir en ajouter sans casser les profils déjà calculés.
- **`onboarding_responses`** — réponses brutes au questionnaire
  d'inscription (`user_id`, `question_id`, `answer`, `created_at`).
  Conservées pour pouvoir recalculer le profil si l'algorithme de
  scoring évolue, sans redemander le questionnaire.
- **`personality_vectors`** — profil de matching calculé : `user_id`,
  `version` (incrémenté à chaque recalcul), `scores` (jsonb :
  `{ axis_key: score }`, score normalisé -1..1), `source`
  (`onboarding` | `recomputed`), `computed_at`. **Le score MVP est
  calculé par une fonction déterministe (barème fixe par réponse), pas
  par appel LLM** — voir §5, ligne directrice explicite du brief
  ("éviter tout calcul IA à chaque interaction").

### Suggestions et décisions

- **`daily_matches`** — une ligne par suggestion proposée un jour donné :
  `user_id`, `candidate_id`, `batch_date`, `rank`, `status`
  (`suggested` | `viewed` | `liked` | `passed`), `created_at`. Généré
  par le batch quotidien (§6), jamais en temps réel.
- **`decisions`** — historique des likes/pass : `user_id`, `target_id`,
  `decision`, `created_at`. Sert à exclure les profils déjà vus des
  prochains batches et (v2) à affiner le profil comportemental.
- **`match_narratives`** (cache) — `profile_low_id`, `profile_high_id`
  (paire ordonnée pour éviter les doublons A→B / B→A), `version_low`,
  `version_high` (versions des `personality_vectors` au moment du
  calcul), `narrative_text`, `axes_snapshot` (jsonb, positions des deux
  profils sur chaque axe pour la constellation), `model_used`,
  `generated_at`. Contrainte d'unicité sur
  `(profile_low_id, profile_high_id, version_low, version_high)` :
  **tant qu'aucun des deux profils n'a changé de version, on sert le
  cache** au lieu de rappeler le LLM — implémente directement la
  consigne de mise en cache du brief.
- **`mutual_likes`** (ou vue calculée à partir de `decisions`) — les
  deux `decision = 'liked'` réciproques ; déclenche la possibilité de
  double opt-in.

### Consentement au chat et conversations

- **`match_consents`** — `mutual_like_id`, `user_id`, `consented_at`.
  Une ligne par personne, insérée seulement après qu'elle a vu l'écran
  d'analyse de compatibilité et cliqué explicitement "je veux discuter".
  Le chat ne s'ouvre que quand les **deux** lignes existent — logique
  portée par une fonction `SECURITY DEFINER` (`try_unlock_chat()`), pas
  par une policy RLS directe, pour le même genre de raison que
  `create_room()`/`join_room()` dans l'app existante.
- **`conversations`** — créée par `try_unlock_chat()`, `id`,
  `mutual_like_id`, `status` (`active` | `blocked` | `closed`),
  `created_at`.
- **`messages`** — `conversation_id`, `sender_id`, `content`,
  `created_at`, `moderation_status` (`ok` | `flagged` | `removed`).

### Sécurité et modération

- **`blocks`** — `blocker_id`, `blocked_id`, `created_at`. Exclut
  immédiatement des futurs batches et cache la conversation existante.
- **`reports`** — `reporter_id`, `reported_id`, `conversation_id`
  (nullable), `reason`, `details`, `status`
  (`pending` | `reviewed` | `actioned`), `created_at`, `reviewed_by`,
  `reviewed_at`. Alimente une file de modération humaine basique (même
  un simple tableau d'admin Supabase Studio suffit au jour 1, comme
  demandé dans le brief — pas besoin d'outil dédié pour le MVP).

## 5. Scoring de personnalité : déterministe, pas de LLM

Le questionnaire d'inscription associe à chaque réponse un vecteur de
poids par axe (ex. répondre X à la question sur le rythme de vie ajoute
+0.3 sur l'axe `energie`). Le calcul du `personality_vectors.scores` est
une simple somme pondérée normalisée — aucun appel IA. Deux bénéfices :

1. Conforme à la contrainte "éviter tout calcul IA en temps réel à
   chaque interaction" : ce calcul peut même tourner de façon
   synchrone à la fin du questionnaire, sans coût ni latence LLM.
2. Le batch nocturne de recalcul (§6) devient trivial à justifier :
   il ne sert qu'à re-scorer si le barème de l'algorithme change de
   version, ou (v2 seulement) à intégrer des signaux comportementaux —
   jamais à interroger un LLM pour chaque profil chaque nuit.

## 6. Pipeline batch

Deux jobs, tous deux en Supabase Edge Function + `pg_cron`, aucun appel
LLM dans ce chemin :

1. **Recalcul nocturne des profils** (`recompute-profiles`, 1x/jour) —
   pour le MVP : re-applique le barème déterministe aux profils dont le
   questionnaire a changé ou dont la version d'algorithme est
   obsolète. Le crochet est prêt pour la v2 (intégration de signaux
   comportementaux type `decisions`), mais son corps reste vide/no-op
   pour ces signaux tant qu'on n'a pas quitté le MVP.
2. **Génération des suggestions du jour** (`generate-daily-matches`, le
   matin) — pour chaque utilisateur vérifié et actif : filtre les
   candidats par préférences déclarées (âge, genre recherché, ville),
   exclut `blocks`/`decisions` déjà pris, calcule une similarité de
   vecteurs (distance cosinus ou euclidienne sur `personality_vectors`,
   en SQL/PL-pgSQL — pas besoin de `pgvector` à ce volume, un calcul
   direct sur du jsonb à quelques axes suffit), garde le top 3 à 5, les
   insère dans `daily_matches`. **Aucun texte narratif n'est généré à
   cette étape** — uniquement des scores internes de tri, jamais
   affichés tels quels (cohérent avec "pas de pourcentage affiché").

La génération de la description narrative (LLM) se déclenche **seulement
à la consultation** d'un match précis par l'utilisateur (Server
Action / route API appelée au clic), avec vérification du cache
`match_narratives` en premier lieu — voir §7.

## 7. Génération narrative + constellation (à la demande, avec cache)

Au clic sur un match dans le fil du jour :

1. Lookup `match_narratives` sur `(profile_low_id, profile_high_id,
   version_low, version_high)`. Si trouvé → retour immédiat, aucun
   appel LLM.
2. Sinon, appel Claude (modèle qualitatif, ex. Sonnet) en tool-use
   structuré (même pattern que `generateCompatibility` existant) avec
   en entrée les deux `scores` d'axes + `bio` succincte des deux
   profils. Le schéma de sortie demande :
   - `narrative_text` : 2-4 phrases, jamais de pourcentage, ton
     bienveillant même quand ça pointe une friction potentielle.
   - pas de score global — seul `axes_snapshot` (déjà connu côté
     serveur depuis les deux `personality_vectors`, pas besoin que le
     LLM le recalcule) sert à la visualisation constellation.
3. Écriture en cache dans `match_narratives`, retour au client.

Le modèle économique (Haiku ou équivalent) n'a pas d'usage dans ce flux
MVP puisque le scoring est déterministe (§5) — il sera pertinent en v2
si on ajoute une étape d'extraction de traits depuis du texte libre
(ex. bio, conversations) pour affiner le profil comportemental.

La **constellation** est un composant de visualisation (radar chart)
consommant `axes_snapshot` : pas de librairie de charts lourde
nécessaire, un SVG généré à partir des coordonnées suffit et reste
cohérent avec la direction artistique du prototype de référence.

## 8. Double opt-in et chat

1. Les deux profils ont un `decision = 'liked'` réciproque →
   `mutual_likes`.
2. Chacun consulte l'écran d'analyse de compatibilité (narrative +
   constellation, §7) — c'est un prérequis d'affichage avant de pouvoir
   consentir, pas juste une formalité de base de données.
3. Chacun clique "je veux discuter" → insertion dans `match_consents`.
4. La RPC `try_unlock_chat()` (`SECURITY DEFINER`) vérifie que les deux
   lignes existent, crée `conversations` si ce n'est pas déjà fait, et
   c'est seulement à partir de là que `messages` devient accessible en
   RLS aux deux membres.

## 9. Modération, blocage, signalement

- Bouton "bloquer" et "signaler" accessibles depuis l'en-tête de
  n'importe quelle conversation (et depuis un profil avant même le
  match). Un blocage est immédiat côté client (RLS empêche aussitôt la
  lecture mutuelle) et asynchrone côté modération (`reports`).
- Modération automatisée légère sur les messages dès le MVP : filtre de
  mots-clés + limite de fréquence (anti-spam) suffisant pour commencer ;
  passage `messages.moderation_status = 'flagged'` alimente la file de
  review humaine (`reports` sert aussi de file générique de modération,
  pas seulement de signalements utilisateurs).
- Review humaine manuelle même simplifiée dès le jour 1, comme demandé
  : au MVP, une vue Supabase Studio filtrée sur `reports.status =
  'pending'` suffit, pas besoin d'admin dédié à construire.

## 10. Vérification et conformité

- **Email** : vérifié par le flow standard Supabase Auth (lien de
  confirmation).
- **Selfie** : upload dans un bucket Storage privé, review manuelle
  (même processus léger que les signalements) qui bascule
  `verifications.status`. Tant que non approuvé, le profil n'apparaît
  pas dans les suggestions des autres (statut "en attente de
  vérification" visible à l'utilisateur).
- **Âge 18+** : `birthdate` déclarée à l'inscription + case de
  consentement horodatée dans `consents` + refus d'inscription si
  calcul d'âge < 18. Traçable via la ligne `verifications` de type
  `age` (auto-approuvée si cohérente, avec la date de déclaration
  conservée — la vérification poussée par pièce d'identité reste v2
  comme indiqué dans le brief).
- **RGPD** : `personality_vectors` et `onboarding_responses` sont des
  données sensibles — consentement explicite dédié dans `consents`
  (distinct du consentement CGU général), et prévoir dès les migrations
  une fonction d'export/suppression complète du compte (droit à l'oubli)
  plutôt que de la rajouter après coup.

## 11. Découpage proposé en étapes de développement

1. **Socle** : scaffold Expo, nouveau projet Supabase, Auth email,
   upload selfie + email verification flow, écrans de consentement
   RGPD/CGU/âge.
2. **Onboarding personnalité** : questionnaire adapté rencontre +
   scoring déterministe → `personality_vectors`.
3. **Pipeline batch** : `recompute-profiles` + `generate-daily-matches`
   (Edge Functions + `pg_cron`), écran "fil du jour" (3 à 5 suggestions).
4. **Détail match** : narrative on-demand + cache + constellation +
   like/pass.
5. **Double opt-in + chat** : `match_consents`, `try_unlock_chat()`,
   écran de conversation (Realtime).
6. **Sécurité** : blocage, signalement, modération automatisée légère,
   vue de review humaine.

## 12. Points encore ouverts

- Dossier unique (monorepo `mobile/` dans ce dépôt) vs dépôt séparé —
  à trancher avant le scaffold initial.
- Barème exact du questionnaire (quelles questions → quels poids sur
  quels axes) : à concevoir avec toi une fois le socle technique en
  place, probablement en atelier dédié plutôt que dans ce document
  d'architecture.
- Modèle Claude exact pour la génération narrative (coût vs qualité) —
  à trancher une fois qu'on a un volume réel d'usage pour arbitrer.
