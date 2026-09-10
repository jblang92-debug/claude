# Casino Party — édition remodelée

Jeu de soirée (façon "Action ou Vérité" casino : machine à sous, roulette,
blackjack, poker) sous forme d'**un seul fichier HTML autonome**, sans build
ni dépendance réseau : React, ReactDOM, Babel Standalone et Three.js sont
embarqués directement dans `index.html`. Il suffit de l'ouvrir dans un
navigateur (double-clic, ou `npx serve casino-party`).

Ce dossier est indépendant du reste du dépôt (l'app Next.js "Miroir") — ce
sont deux projets distincts.

## À propos de « la connexion avec Blender »

Blender est un logiciel de bureau de création 3D (modélisation, sculpt,
rendu) : il n'existe aucun moyen de le « connecter » en direct à une page
web — il n'y a pas de serveur Blender à interroger au chargement de l'app,
et rien dans ce dépôt ne fait tourner Blender.

Ce qui donne le rendu 3D réaliste dans un navigateur, y compris pour des
scènes créées *dans* Blender, c'est un moteur de rendu temps réel — ici
**Three.js/WebGL**, déjà utilisé par l'app d'origine pour la machine à sous,
la roulette et la table de feutre. Le remodelage a donc porté sur la qualité
de ce rendu, avec les mêmes techniques qui donnent au viewport de Blender
son réalisme :

- **Reflets d'environnement** (`PMREMGenerator` + texture procédurale de
  "salle de casino") appliqués à l'or et aux jetons métalliques — sans ça,
  un matériau très métallique/peu rugueux reste terne, quelle que soit la
  lumière directe.
- **Ombres portées** (PCF soft shadows) sur la roulette, la table de feutre
  et les jetons/pièces qui tombent.
- **Tone mapping filmique (ACES)** + colorimétrie sRGB, pour un rendu moins
  "plastique".
- **Grain de matière** (feutre, bois) en bump map, pour casser les aplats.

## Nouveauté : ouverture cinématique (effet "wahou")

Au lancement, une scène 3D plein écran s'affiche avant l'écran de
configuration : pluie de pièces d'or et de cartes, roulette géante qui
tourne en arrière-plan, logo « CASINO PARTY » qui s'anime, avant de basculer
sur l'app (bouton « Entrer dans la soirée », ou appui n'importe où une fois
le bouton affiché).

## Vérifié dans cet environnement

L'app a été chargée avec Chromium headless (Playwright) : aucune erreur
JS/console, transition intro → configuration → menu → roulette / blackjack
/ machine à sous fonctionnelle. À tester ensuite sur un vrai téléphone (l'UI
est mobile-first) — les performances 3D dépendent du GPU de l'appareil.
