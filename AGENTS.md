# marmurdoku

**Niveau de Murdoku jouable** dont la zone est le plan des bureaux de Marmelab
et les protagonistes ses employés. Application **100% front-end**, interface en
**français**. Partage la stack et les conventions de `pom-poche`.

Principe du jeu : la grille est le plan des bureaux, découpé en pièces et garni
de meubles. Le joueur place chaque personne (suspects et victime) pour qu'il y
ait exactement une personne par ligne et par colonne, en respectant les
indices. La personne seule dans une pièce avec la victime est le coupable.

Casting : les 20 participants actifs de `marmelab-en-voyage` ; François est
la victime, Thiery le coupable. Leurs avatars y sont copiés, réduits à 160px,
dans `public/avatars/<id>.png` (fond de Thiery détouré, signature « SP-STUDIO.DE » retirée).

> Le niveau est jouable de bout en bout : plan, indices validés (solution
> unique), interface de jeu, reconstitution finale.

---

## Stack technique

| Outil | Usage |
|---|---|
| Vue 3 (`<script setup>`) + TypeScript | UI |
| Vite | Build / dev server (port **2020**) |
| Tailwind CSS v4 | Styles (via `@tailwindcss/vite`, pas de config JS) |
| Fontsource | Creepster (titres) et Special Elite (machine à écrire), auto-hébergées |
| Vitest + Testing Library (Vue) | Tests unitaires et composants |
| Prettier | Formatage |
| ESLint (eslint-plugin-vue + @vue/eslint-config-typescript) | Linting |
| Knip | Détection des fichiers / exports / dépendances inutilisés |

Zéro dépendance runtime en dehors de Vue et de la police.

---

## Arborescence

```
public/
├── avatars/                  # Avatars des 20 personnages (160px, depuis ~/Images/Avatars/*-sp2.png)
├── favicon.svg               # Logo Marmelab (favicon de la homepage) recoloré en rouge
├── favicon.png, apple-touch-icon.png # Icônes PNG tirées du SVG (`make icons`)
├── og.png                    # Image de partage 1200x630 (`make og`)
└── robots.txt, sitemap.xml, site.webmanifest
og.html                       # Page de l'image de partage, rendue par `make og` (hors build)
src/
├── components/
│   ├── OfficeMap.vue         # La carte : le plan, puis les couches du joueur ou l'image de la reconstitution, sous la caméra
│   ├── MapPlan.vue           # Le plan seul : sols (et cour prolongée sous la carte), meubles, quadrillage, murs, noms des pièces
│   ├── MapCoordinates.vue    # Lettres et numéros autour de la carte, effacés pendant un zoom
│   ├── FloorPatterns.vue     # Motifs SVG des sols (un par FloorKind) et ombre portée
│   ├── FurniturePiece.vue    # Place un meuble sur la grille, l'oriente, choisit son sprite
│   ├── PeopleLayer.vue       # Avatars sur leurs cases, halo blanc qui suit leur contour ; marches et effets de la reconstitution
│   ├── NotesLayer.vue        # Positions notées : initiale sur la couleur du suspect, 3x3 par case
│   ├── CellLayer.vue         # Couche du joueur : croix, survol, sélection, infobulle, cibles de clic et de dépôt (data-cell)
│   ├── ReconstructionLayer.vue # Reconstitution : bulles, zzz, notes
│   ├── ReconstructionControls.vue # Pendant la reconstitution : clic pour passer à l'image suivante, « Passer »
│   ├── VerdictOverlay.vue    # Message devant la carte : « Raté ! », invitation à la reconstitution, « Affaire classée »
│   ├── GameTitle.vue         # Le titre et sa coulure de sang (en grand sur l'image de partage)
│   ├── BloodDrip.vue         # Coulure de sang sous le titre
│   ├── CastPanel.vue         # Rapport d'enquête, « Les suspects », barre d'outils et fiches
│   ├── CastCard.vue          # Fiche du panneau : clic pour choisir, appui pour glisser
│   ├── SuspectCard.vue       # Fiche d'un suspect : avatar, nom sur sa couleur, indices, case ou nombre de notes
│   ├── GameToolbar.vue       # Vérifier, Placer / Noter, annuler / refaire, Sauvegardes
│   ├── DragGhost.vue         # Ce qui suit le pointeur pendant un glisser : l'avatar ou la croix
│   ├── CrossIcon.vue         # La croix de la fiche Croix et de son glisser
│   ├── SavesDialog.vue       # Fenêtre des sauvegardes : nommer, charger, supprimer
│   ├── RulesDialog.vue       # Fenêtre des règles (bouton « Règles » du rapport d'enquête)
│   └── furniture/            # Sprites SVG : sièges, tables et revêtements, décor
├── composables/
│   ├── useGame.ts            # La partie : historique, sélection, mode, verdict, raccourcis
│   ├── useSaves.ts           # Sauvegardes nommées, dans le localStorage
│   ├── useReconstruction.ts  # Joue la reconstitution, image par image
│   └── useDrag.ts            # Glisser un personnage ou la croix (souris ou tactile) vers une case
├── data/
│   ├── zones.ts              # Les 14 zones : code de grille, nom, sol, étage
│   ├── office.ts             # Grille 20x20 des zones et liste des meubles
│   ├── people.ts             # Les 20 personnages, la victime, le coupable
│   ├── clues.ts              # Les indices : texte affiché et règles vérifiées par le solveur et le jeu
│   ├── reconstruction.ts     # Le script de la reconstitution, scène par scène
│   └── solution.ts           # La solution, en coordonnées de la carte (« B3 »)
├── lib/
│   ├── grid.ts               # Types Zone / Cell, lecture de la grille des zones
│   ├── furniture.ts          # Types de meubles, cases couvertes, cases occupables
│   ├── walls.ts              # Segments entre zones (mur, clôture, garde-corps, plancher)
│   ├── board.ts              # Plateau pour les règles : zones, cases plaçables, meubles par case, « près de »
│   ├── rules.ts              # Règles des indices (par personne, globales, meurtre) : ok / enfreinte / ouverte
│   ├── solver.ts             # Vérifie un placement complet (puzzleStatus), cherche les solutions (solve)
│   ├── difficulty.ts         # Joueur simulé : lecture simple, cases possibles placement après placement
│   ├── game.ts               # État du joueur et ses coups : clic (placer, croix, noter), dépôt, verdict
│   ├── history.ts            # Annuler / refaire sur des états immuables
│   ├── saves.ts              # Liste des sauvegardes : ajout, retrait, lecture tolérante
│   ├── reconstruction.ts     # Script de la reconstitution en suite d'images : caméra, positions, bulles
│   ├── tooltips.ts           # Texte des infobulles : qui se tient sur la case, meubles
│   └── geometry.ts           # Taille d'une case, coordonnées de la carte (« B3 ») dans les deux sens
├── puzzle.ts                 # Le niveau assemblé depuis data/ (plateau, personnages, indices, solution)
├── App.vue                   # La page
├── index.css                 # Import Tailwind, thème, styles des composants
├── main.ts                   # Point d'entrée
└── vite-env.d.ts
tools/
├── solve.test.ts             # `make solve` : diagnostic d'unicité (config vitest.solve.config.ts)
├── og.ts                     # Point d'entrée de og.html
└── OgCard.vue                # L'image de partage : titre, accroche, plan vide, ruban de police
tests/
├── setup.ts                  # jest-dom + matchMedia pour jsdom
├── unit/                     # Vitest : src/lib/
└── component/                # Vitest + Testing Library : la page entière
```

---

## Le plan

- Redessiné à partir de la carte Tiled de `Marmemap` (`map.json`), en grille
  carrée 20x20 qui intègre la cour en bas.
- **Coordonnées** : colonnes A à T, lignes 1 à 20 (A1 en haut à gauche),
  affichées autour de la carte. Les retouches et la solution s'expriment ainsi.
- **Étage** : les lignes 1 à 3. La Mezzanine (ouest) est au-dessus du Bureau
  du chef et du WC, l'Aquarium (est) au-dessus du Petit open space ; le reste
  de la bande est le vide sur le Grand open space
  (`.` dans la grille, aucune personne possible).
- Les murs ne sont pas des cases : ils passent sur les bords entre deux zones
  (`zoneBoundaries`). Entre deux zones extérieures (Communs, Cour) c'est une
  clôture ; au bord du vide, un garde-corps ; entre l'étage et le
  rez-de-chaussée, un trait de plancher.
- **Occupation des cases** : une personne peut se tenir sur le sol ou sur un
  meuble marqué `occupiable` dans `FURNITURE_KINDS` (sièges, lit, tapis,
  toilettes, douche). Les autres meubles bloquent leurs cases, même posés
  sur un tapis.
- Les sprites sont dessinés orientés vers le sud ; `facing` fait pivoter les
  meubles d'une case. Pour un bureau, `facing` est le côté où s'assoit son
  utilisateur (l'écran est du côté opposé) ; les îlots de 2 colonnes placent
  leurs utilisateurs à l'ouest et à l'est, ceux de 2 lignes au nord et au sud.

## Mise en page

- Sur grand écran (`lg`), la page tient dans la hauteur de la fenêtre sans
  défiler : la carte seule à droite, sur toute la hauteur (sa largeur suit,
  elle est carrée, au plus la moitié de l'écran) ; à gauche, le titre et le
  panneau des personnages, qui défile seul si besoin.
- Fenêtres peu hautes (variante `short:`, hauteur ≤ 820px, dans `index.css`) :
  le ruban disparaît, titre, sous-titre et liste des suspects se resserrent,
  pour que les 20 fiches tiennent sans défiler (vérifié en 1366x768).
- En dessous, tout s'empile et la page défile normalement.

## Solution et mode debug

- `data/solution.ts` place chaque personnage. `tests/unit/solution.test.ts`
  vérifie qu'elle n'enfreint aucune règle (`brokenRules`, comme le bouton
  « Vérifier ») et qu'elle raconte la bonne histoire : le coupable seul avec
  la victime dans sa pièce, ce que les règles, elles, ignorent.
- **Mode debug** : `?debug` dans l'URL (http://localhost:2020/?debug) affiche
  la solution et hache en rouge les cases non plaçables, sans encart dans la
  page ; les règles enfreintes partent dans la console.

## Interactions

- Clic sur un personnage : le sélectionne (un seul à la fois), ou le
  désélectionne.
- Clic sur une case, avec un personnage sélectionné : l'en retire s'il s'y
  tient, sinon l'y place, à la place de la croix ou de la personne qui s'y
  trouvait. Sans sélection : retire la croix, ou en met une (à la place de la
  personne qui s'y tenait).
- Glisser un personnage (depuis le panneau ou la carte) vers une case : la
  case survolée s'allume, le dépôt remplace ce qu'elle contenait.
- Case pointée, à la souris ou pendant un glisser : sa ligne et sa colonne
  s'éclairent en entier, et sa lettre et son numéro autour de la carte
  (`OfficeMap.vue`). Au doigt, seulement pendant un glisser.
- Survol d'une case pendant une seconde : une infobulle nomme qui s'y tient
  et les meubles qui s'y trouvent (libellés de `FURNITURE_KINDS`).
- Seules les cases plaçables acceptent clics et dépôts. La logique est pure
  (`lib/game.ts`, testée) ; le glisser passe par les événements pointeur.
- **Mode Placer / Noter** (`GameToolbar.vue`) : en mode Noter, un clic note
  ou retire une position possible du suspect sélectionné ; les notes
  s'affichent en pastilles dans les cases : l'initiale en blanc sur la
  couleur du suspect (`colorOf`, `initialOf`, `inkOn` pour un texte foncé
  sur les couleurs claires, dans `data/people.ts` ; sur sa fiche, son nom est
  écrit dans une bulle de la même couleur), jamais estompées ; leur nombre sur la fiche. Les
  couleurs sont choisies à la main : à initiale commune (4 A, 4 J, 2 G, 2 M,
  2 T), familles de couleur nettement différentes. Le joueur seul les écrit : le jeu ne calcule rien pour lui.
  Placer quelqu'un efface les notes des autres sur sa ligne et sa colonne,
  dans le même coup (non désactivable).
  Une croix efface toutes les notes de sa case, dans le même coup.
- **Croix** : une fiche de plus, dans la case libre après les 20 suspects
  (`CastPanel.vue`). Elle est enfoncée dès que personne n'est sélectionné
  (après un placement, par exemple) ; cliquer dessus désélectionne. Elle se
  glisse aussi vers une case, comme un personnage : la croix remplace ce que
  la case contenait.
- **Croix automatiques** : placer quelqu'un barre aussi les cases
  plaçables libres de sa ligne et de sa colonne, dans le même coup. Ce sont
  des croix ordinaires : le joueur les retire comme les siennes, et elles
  restent si la personne est déplacée ou retirée.
- **Curseur sur la grille** : il dit aussi ce que fera le clic : crayon plein
  pour placer, crayon en pointillés pour noter, croix rouge pour barrer.
- **Annuler / refaire** : un seul historique pour tous les coups (placements,
  croix, notes), `lib/history.ts` ; boutons ↶ ↷, Ctrl+Z, Ctrl+Y ou
  Ctrl+Maj+Z. La sélection n'en fait pas partie. L'état de partie vit dans
  `composables/useGame.ts`.
- **Sauvegardes** (`SavesDialog.vue`) : enregistrer la grille (placements,
  croix, notes) sous un nom (par défaut « Partie du … »), puis charger ou
  supprimer depuis la liste, chacun après un « Oui » sur la ligne. Stockées dans le localStorage du navigateur
  (`composables/useSaves.ts`, lecture tolérante dans `lib/saves.ts`) : sans
  stockage, elles ne vivent que le temps de la session. Charger est un coup,
  que ↶ annule.
- **Vérifier** (à droite de « Les suspects ») : grisé tant que tout le monde
  n'est pas placé. Le verdict (`brokenRules`) juge sur les règles, pas sur
  `data/solution.ts` : toute solution que les indices permettent gagne.
  Échec : « Raté ! » devant la carte cite jusqu'à trois règles enfreintes
  (une par ligne et par colonne d'abord, puis le meurtre, les indices
  généraux, ceux des fiches), et reste jusqu'au clic sur « OK ». Succès :
  « La scène du crime correspond aux témoignages » et « Voir la
  reconstitution », puis « Affaire classée » révèle le coupable, reste
  affiché et fige la partie, jusqu'au chargement d'une sauvegarde
  (`VerdictOverlay.vue`). Les parties à deux affirmations d'un indice
  (`parts` dans `data/clues.ts`) sont citées séparément.

## Reconstitution

- Le script est dans `data/reconstruction.ts` : une scène par groupe de
  suspects, le meurtre en dernier. Chaque scène zoome sur son casting, là
  où il finit la scène (un marcheur peut entrer dans le cadre ; `frame`
  ajoute des cases au cadre), joue ses temps (réplique, marche, effets :
  zzz, notes, flou sous le haut de la tête, secousses du baby-foot, chute),
  puis dézoome. Les effets du premier temps sont là dès le début du zoom et
  durent jusqu'à la scène suivante (ceux du meurtre restent derrière le
  message de fin). Les marcheurs restent où ils sont allés.
- Les marches font quelques cases sans traverser de mur, sauf celles
  marquées `enters` (Guiom qui rejoint la salle de pause), qui changent de
  pièce une fois ; `tests/unit/reconstruction.test.ts` le vérifie.
- `lib/reconstruction.ts` en tire une suite d'images (`timeline`), que
  `composables/useReconstruction.ts` joue : un clic sur la carte passe à
  l'image suivante, « Passer » va au message de fin, qui garde la dernière
  image derrière lui.
- Rendu : la caméra est une transformation CSS de la carte (`OfficeMap`),
  les personnes marchent par transition (`PeopleLayer`), les bulles et
  effets sont dans `ReconstructionLayer.vue`, à taille constante à
  l'écran. Avec `prefers-reduced-motion`, zooms et marches deviennent des
  coupes franches.

## Indices et solveur

- `data/clues.ts` : chaque indice a son texte et ses règles (`lib/rules.ts`).
  Les règles disent, pour un placement même partiel, si l'indice est
  respecté, enfreint ou encore ouvert : c'est la base du moteur de jeu.
- `lib/solver.ts` : `puzzleStatus` vérifie un placement complet ; `solve`
  cherche jusqu'à deux solutions (domaine de chaque personne d'après ses
  propres indices, personne la plus contrainte d'abord, couplage lignes /
  colonnes, règles de pièce et indices de comptage appliqués en cours de
  route). Quelques dizaines de millisecondes sur le niveau.
- `make solve` (`tools/solve.test.ts`, hors `make test`) : dit si les indices
  ne mènent qu'à `data/solution.ts` ; sinon, montre une autre solution valide,
  personne par personne, par rapport à `data/solution.ts`. Si la solution est
  unique, retire chaque règle tour à tour et liste celles dont l'absence la
  laisse unique (règles superflues, une par une : pas forcément toutes
  ensemble). À relancer après chaque nouvel indice.
- `make solve` mesure aussi la difficulté (`lib/difficulty.ts`) : la lecture
  simple d'un joueur sans essai (`analyze`), et l'évolution des cases
  possibles placement après placement (`rounds`), avec min / médiane / max et
  un score d'ouverture (somme des log2 du minimum, par tiers).
- `tests/unit/solver.test.ts` garantit l'unicité : une retouche du plan ou des
  indices qui ouvre une autre solution fait échouer `make test`.
- Règles de vocabulaire des indices : en tête de `data/clues.ts`, répétées
  au joueur dans `RulesDialog.vue` (les garder alignées). « Près de » ne
  traverse pas les murs : la case voisine doit être dans la même pièce
  (`isNear`).

## SEO et partage

- Publié sur https://marmurdoku.vercel.app. `index.html` porte des
  `%SITE_URL%` remplacés au build (`vite.config.ts`) : `SITE_URL`, sinon
  l'adresse de production Vercel, sinon celle-ci. Les réseaux refusent les
  URL relatives d'`og:image`.
- Balises : description, canonical, Open Graph, Twitter, données structurées
  `VideoGame`, manifeste, icônes ; `robots.txt` et `sitemap.xml` dans
  `public/`.
- L'image de partage (`tools/OgCard.vue`) réutilise les vrais composants
  (`GameTitle`, `MapPlan`) : `make og` la régénère après une retouche du plan
  ou du titre. Elle ne montre ni personne ni indice.
- Ni le README ni les métadonnées ne dévoilent la victime, le coupable ou
  les indices.

## Charte graphique

Style « murder party » (les variables sont dans le `@theme` de `index.css`) :
fond nuit (`night`) avec des halos rouges, rouge sang (`blood`,
`blood-bright`, `blood-dark`), jaune de ruban de police (`tape`), fiches
d'enquête sur papier ancien (`.paper`, texte `ink`), tampons (`.stamp`).
Polices : Creepster pour les titres qui crient (titre, « Les suspects »),
Special Elite (machine à écrire) pour tout le reste. Le titre est souligné
d'une coulure de sang (`BloodDrip.vue`), la page s'ouvre sur un ruban
« Scène de crime ». Les noms de pièces de la carte restent dans une police
sans empattement étroite, pour tenir dans leur pièce.

---

## Contraintes techniques

- **100% front-end** : aucun appel serveur, pas de backend.
- **Pas de SSR** : Vite SPA. Ne pas introduire Nuxt.
- **Alias `@/`** pointe vers `src/`. Toujours l'utiliser pour les imports
  internes, jamais de chemins relatifs `../../`.
- **Tailwind v4** : `@import 'tailwindcss'` dans le CSS, pas de
  `tailwind.config.js`. Les classes ne doivent **jamais être construites
  dynamiquement** (`text-${color}`) : Tailwind ne les détecte pas.
- **Images de `public/`** : toujours via un `src` lié (`:src="CONSTANTE"`),
  jamais `src="fichier.webp"` en dur dans un gabarit Vue.
- **TypeScript strict** : `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess` activés. Ne pas les désactiver.
- **Employés** : ce sont de vraies personnes. N'ajouter que celles qui ont
  accepté d'apparaître dans le jeu.

---

## Règles de développement

### Structure
- `src/data/` : contenu, zéro logique.
- `src/lib/` : logique pure, zéro import Vue, entièrement testée.
- `src/components/` : présentation, en SFC `<script setup lang="ts">`.
- **Taille des fichiers** : viser < ~300 lignes ; au-delà, découper.

### Qualité du code
- **Factoriser, ne pas dupliquer** : extraire les helpers et composants
  réutilisables.
- **Pas de code mort** : `make knip` doit rester vert.
- **Commentaires utiles seulement** : expliquer le pourquoi / le non-évident ;
  ne jamais paraphraser le code. Le pourquoi vit de préférence dans ce fichier.

### Accessibilité
- Tout cliquable est un bouton/lien avec libellé accessible ; focus clavier
  visible ; ne jamais coder l'information par la seule couleur.
- Respecter `prefers-reduced-motion` pour toute animation.

### Qualité (avant de considérer une tâche terminée)
- `make check` doit passer (build + lint + typecheck + knip + tests).

---

## Commandes (Makefile)

| Commande | Effet |
|---|---|
| `make install` | Installe les dépendances |
| `make start` | Serveur de dev (http://localhost:2020) |
| `make build` | Build de production |
| `make preview` | Build puis prévisualisation locale |
| `make lint` | ESLint |
| `make knip` | Détecte fichiers / exports / dépendances inutilisés |
| `make format` | Formate avec Prettier |
| `make format-check` | Vérifie le formatage |
| `make typecheck` | Vérifie les types |
| `make test` | Tests unitaires et composants |
| `make solve` | Dit si les indices ne mènent qu'à `data/solution.ts` ; sinon, montre une autre solution valide |
| `make og` | Régénère `public/og.png` depuis `og.html` (Chrome) |
| `make icons` | Régénère les icônes PNG depuis `public/favicon.svg` (ImageMagick) |
| `make fix` | Format + lint |
| `make check` | build + lint + typecheck + knip + tests |
| `make clean` | Supprime `dist`, `node_modules`, `coverage` |

---

## Conventions globales du dépôt

- **Code en anglais** : commentaires, identifiants, noms de variables et de
  fonctions. Seules les valeurs affichées à l'utilisateur sont en français.
- **Commits** : pas de trailer `Co-Authored-By`. Vaut aussi pour les
  descriptions de pull request.
- **Typographie** : ne jamais introduire de tiret long (em-dash ou en-dash) dans
  le code, les chaînes, les commentaires ou la doc. Utiliser un tiret ASCII `-`,
  deux-points, parenthèses, ou reformuler.
