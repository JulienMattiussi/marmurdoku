# marmerdoku

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

> Le plan et une solution valide sont en place ; les indices et l'interface de
> jeu restent à faire.

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
├── avatars/                  # Avatars des 20 personnages (160px, copiés de marmelab-en-voyage)
└── favicon.svg               # Logo Marmelab (favicon de la homepage) recoloré en rouge
src/
├── components/
│   ├── OfficeMap.vue         # Le plan en SVG : sols, meubles, quadrillage, murs, noms des pièces
│   ├── FloorPatterns.vue     # Motifs SVG des sols (un par FloorKind) et ombre portée
│   ├── FurniturePiece.vue    # Place un meuble sur la grille, l'oriente, choisit son sprite
│   ├── PeopleLayer.vue       # Avatars sur leurs cases, halo blanc qui suit leur contour
│   ├── CellLayer.vue         # Couche du joueur : croix, survol, sélection, infobulle, cibles de clic et de dépôt (data-cell)
│   ├── BloodDrip.vue         # Coulure de sang sous le titre
│   ├── VerdictOverlay.vue    # Message de fin devant la carte : « Affaire classée » ou « Raté ! »
│   ├── RulesDialog.vue       # Fenêtre des règles (bouton « Règles » du rapport d'enquête)
│   ├── CastPanel.vue         # « (02) Les personnages » : les 20 avatars, à droite de la carte
│   └── furniture/            # Sprites SVG : sièges, tables et revêtements, décor
├── composables/
│   └── usePersonDrag.ts      # Glisser un personnage (souris ou tactile) vers une case
├── data/
│   ├── zones.ts              # Les 14 zones : code de grille, nom, sol, étage
│   ├── office.ts             # Grille 20x20 des zones et liste des meubles
│   ├── people.ts             # Les 20 personnages, la victime, le coupable
│   ├── clues.ts              # Les indices : texte affiché et règles vérifiées par le solveur et le jeu
│   └── solution.ts           # La solution, en coordonnées de la carte (« B3 »)
├── lib/
│   ├── grid.ts               # Types Zone / Cell, lecture de la grille des zones
│   ├── furniture.ts          # Types de meubles, cases couvertes, cases occupables
│   ├── walls.ts              # Segments entre zones (mur, clôture, garde-corps, plancher)
│   ├── solution.ts           # Lecture des coordonnées, règles enfreintes par une solution
│   ├── board.ts              # Plateau pour les règles : zones, cases plaçables, meubles par case, « près de »
│   ├── rules.ts              # Règles des indices (par personne, globales, meurtre) : ok / enfreinte / ouverte
│   ├── solver.ts             # Vérifie un placement complet (puzzleStatus), cherche les solutions (solve)
│   ├── game.ts               # État du joueur et ses actions : sélection, clic sur une case, dépôt
│   └── geometry.ts           # Taille d'une case, lettres des colonnes
├── puzzle.ts                 # Le niveau assemblé depuis data/ (plateau, personnages, indices, solution)
├── App.vue                   # La page
├── index.css                 # Import Tailwind, thème, styles des composants
├── main.ts                   # Point d'entrée
└── vite-env.d.ts
tools/
└── solve.test.ts             # `make solve` : diagnostic d'unicité (config vitest.solve.config.ts)
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
- En dessous, tout s'empile et la page défile normalement.

## Solution et mode debug

- `data/solution.ts` place chaque personnage (une personne par ligne et par
  colonne, sur une case plaçable ; le coupable seul avec la victime dans sa
  pièce). `tests/unit/solution.test.ts` vérifie ces règles avec
  `solutionProblems`.
- **Mode debug** : `?debug` dans l'URL (http://localhost:2020/?debug) affiche
  la solution et hache en rouge les cases non plaçables, sans encart dans la
  page ; les règles enfreintes partent dans la console.

## Interactions

- Clic sur un personnage : le sélectionne (un seul à la fois), ou le
  désélectionne.
- Clic sur une case : la vide si elle est occupée (personne ou croix) ; sinon
  y place le personnage sélectionné, ou y met une croix si personne ne l'est.
- Glisser un personnage (depuis le panneau ou la carte) vers une case : la
  case survolée s'allume, le dépôt remplace ce qu'elle contenait.
- Survol d'une case pendant une seconde : une infobulle nomme qui s'y tient
  et les meubles qui s'y trouvent (libellés de `FURNITURE_KINDS`).
- Seules les cases plaçables acceptent clics et dépôts. La logique est pure
  (`lib/game.ts`, testée) ; le glisser passe par les événements pointeur.
- **Vérifier** (à droite de « Les suspects ») : grisé tant que tout le monde
  n'est pas placé. Le verdict (`isSolved`) juge sur les règles, pas sur
  `data/solution.ts` : toute solution que les indices permettent gagne.
  Échec : « Raté ! » devant la carte pendant 2,5 s, puis on continue. Succès :
  « Affaire classée » révèle le coupable, reste affiché et fige la partie
  (`VerdictOverlay.vue`).

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
  personne par personne, par rapport à `data/solution.ts`. À relancer après
  chaque nouvel indice.
- Règles de vocabulaire des indices : en tête de `data/clues.ts`, répétées
  au joueur dans `RulesDialog.vue` (les garder alignées). « Près de » ne
  traverse pas les murs : la case voisine doit être dans la même pièce
  (`isNear`).

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
