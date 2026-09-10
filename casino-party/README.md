# Casino Party — édition remodelée

Jeu de soirée (façon "Action ou Vérité" casino : machine à sous, roulette,
blackjack, poker) sous forme d'**un seul fichier HTML autonome**, sans build
ni dépendance réseau : React, ReactDOM, Babel Standalone et Three.js sont
embarqués directement dans `index.html`. Il suffit de l'ouvrir dans un
navigateur (double-clic, ou `npx serve casino-party`).

Ce dossier est indépendant du reste du dépôt (l'app Next.js "Miroir") — ce
sont deux projets distincts.

## À propos de « la connexion avec Blender »

Blender est un logiciel de bureau : il n'existe aucun moyen de le
« connecter » en direct à une page web (pas de serveur Blender interrogé au
chargement). En revanche, il **s'automatise en Python** (`bpy`), y compris
en mode headless sans interface graphique — c'est ce qui a été utilisé ici.

### Le pipeline réellement mis en place

`blender/model_assets.py` est un script `bpy` (exécuté avec le paquet
`pip install bpy`, sans installation de Blender en tant que telle) qui
modélise deux objets avec de vraies opérations Blender :

- **`chip.glb`** — un jeton de casino : cylindre + modificateur **Bevel**
  (biseau arrondi sur la tranche) + un tore doré fusionné en insert de bord
  (deux matériaux PBR).
- **`wheel_hub.glb`** — le moyeu doré central de la roulette : modélisé en
  **tournage** (`bmesh.ops.spin`, l'équivalent programmatique de l'outil
  "Spin" de Blender / un tour à bois) à partir d'un profil (rayon, hauteur),
  comme une pièce de tournerie classique — bien plus fidèle qu'un empilement
  de primitives brutes.

Ces deux fichiers sont exportés en **glTF binaire (.glb)** sans texture (que
des facteurs PBR simples — couleur, métallicité, rugosité), ce qui permet de
les charger avec un petit parseur GLB écrit à la main (~70 lignes,
`loadGLBModel` dans `index.html`) plutôt que le loader officiel Three.js —
il n'était pas inclus dans le bundle d'origine et ça évite d'aller le
chercher sur un CDN. Les `.glb` sont encodés en base64 et embarqués
directement dans `index.html` (voir `CHIP_GLB_B64` / `WHEEL_HUB_GLB_B64`) :
zéro requête réseau, le fichier reste ouvrable en double-clic.

Ces modèles Blender remplacent maintenant les primitives Three.js d'origine
à trois endroits : le moyeu de la roulette (`Roulette3D`), les piles de
jetons décoratives sur la table (`Table3D`), et les pièces qui pleuvent dans
l'intro (`IntroScene`).

Pour régénérer les `.glb` après une modification du script :

```bash
pip install bpy
python3 blender/model_assets.py   # écrit chip.glb et wheel_hub.glb à côté du script
# puis ré-encoder en base64 et remplacer CHIP_GLB_B64 / WHEEL_HUB_GLB_B64 dans index.html
```

### Le rendu (le reste du réalisme)

Le rendu 3D dans le navigateur — y compris pour ces modèles issus de
Blender — reste **Three.js/WebGL**, déjà utilisé par l'app d'origine pour la
machine à sous, la roulette et la table de feutre. Le remodelage a aussi
porté sur la qualité de ce rendu, avec les mêmes techniques qui donnent au
viewport de Blender son réalisme :

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
