import { WOMEN } from '@/data/people'
import type { Clue, GlobalRule, PersonRule } from '@/lib/rules'

/**
 * What the player knows, each clue as shown (`text`) and as checked by the
 * solver and the game (`rule`, rows and columns counted from 0). Keep the two
 * in step. Wording rules: a "table" is any table or desk; "plants" include
 * the flower bed of the yard (these two are not told to the player); "near"
 * means on a neighboring cell (up, down, left or right) of the same room;
 * "with someone" means in the same room (both told in RulesDialog.vue).
 */
const TABLES = ['table', 'desk', 'plainDesk', 'facingDesk'] as const
const PLANTS = ['plant', 'flowerBed'] as const
/** What one sits on ("était assis"). */
const SEATS = ['chair', 'stool', 'sofa'] as const

export const CLUES: Record<string, Clue<PersonRule>[]> = {
  adrieng: [
    {
      text: 'était assis à côté d’une table',
      rules: [
        { type: 'onFurniture', kinds: [...SEATS] },
        { type: 'nearFurniture', kinds: [...TABLES] },
      ],
    },
  ],
  alexandra: [
    { text: 'était à côté d’un escalier', rules: [{ type: 'nearFurniture', kinds: ['stairs'] }] },
  ],
  anthony: [
    {
      text: 'était avec Thibault, juste au-dessus de lui',
      rules: [
        { type: 'sameZoneAs', person: 'thibault' },
        { type: 'above', person: 'thibault', rows: 1 },
      ],
    },
  ],
  antoine: [{ text: 'était dans le lit', rules: [{ type: 'onFurniture', kinds: ['bed'] }] }],
  benoit: [
    {
      text: 'était dans la salle de bain, à côté des toilettes',
      rules: [
        { type: 'inZone', zones: ['bathroom'] },
        { type: 'nearFurniture', kinds: ['toilet'] },
      ],
    },
  ],
  caroline: [
    {
      text: 'était sur une chaise, dans le coin d’une zone',
      rules: [{ type: 'onFurniture', kinds: ['chair'] }, { type: 'inCorner' }],
    },
  ],
  erwan: [
    {
      text: 'était seul, près d’un extincteur',
      rules: [{ type: 'alone' }, { type: 'nearFurniture', kinds: ['extinguisher'] }],
    },
  ],
  francois: [
    {
      text: 'était sur une chaise, sur une des 6 lignes du haut',
      rules: [
        { type: 'onFurniture', kinds: ['chair'] },
        { type: 'inRows', rows: [0, 1, 2, 3, 4, 5] },
      ],
    },
  ],
  guillaume: [
    { text: 'était près d’un vélo', rules: [{ type: 'nearFurniture', kinds: ['bike'] }] },
  ],
  guiom: [{ text: 'était seul', rules: [{ type: 'alone' }] }],
  jeremie: [{ text: 'était sur un tapis', rules: [{ type: 'onFurniture', kinds: ['rug'] }] }],
  jibe: [
    {
      text: 'était debout dans un open space, à côté d’une chaise',
      rules: [
        { type: 'notOnFurniture', kinds: [...SEATS, 'bed', 'toilet'] },
        { type: 'inZone', zones: ['large-open-space', 'small-open-space'] },
        { type: 'nearFurniture', kinds: ['chair'] },
      ],
    },
  ],
  jerome: [{ text: 'était près d’une télé', rules: [{ type: 'nearFurniture', kinds: ['tv'] }] }],
  julio: [
    {
      text: 'était à une colonne d’écart de Jérome',
      rules: [{ type: 'columnGap', person: 'jerome', gap: 1 }],
    },
  ],
  karen: [
    {
      text: 'n’était pas seule, exactement à une colonne de Thiery, et plus près des boîtes aux lettres que Jibé',
      rules: [
        { type: 'notAlone' },
        { type: 'columnGap', person: 'thiery', gap: 1 },
        { type: 'closerThan', kinds: ['mailbox'], person: 'jibe' },
      ],
    },
  ],
  matthieu: [
    {
      text: 'était dans la salle de pause, à exactement 3 colonnes de Julio',
      rules: [
        { type: 'inZone', zones: ['break-room'] },
        { type: 'columnGap', person: 'julio', gap: 3 },
      ],
    },
  ],
  maxime: [
    { text: 'était dans la dernière colonne', rules: [{ type: 'inColumns', cols: [19] }] },
    {
      text: 'était seul avec deux femmes',
      rules: [{ type: 'roomWith', count: 2, among: WOMEN }],
    },
  ],
  sohanne: [{ text: 'était sur la ligne 16', rules: [{ type: 'inRows', rows: [15] }] }],
  thibault: [
    {
      text: 'fumait dans la cour à côté d’un vélo',
      rules: [
        { type: 'inZone', zones: ['yard'] },
        { type: 'nearFurniture', kinds: ['bike'] },
      ],
    },
  ],
  thiery: [
    {
      text: 'était dans une pièce en hauteur',
      rules: [{ type: 'inZone', zones: ['mezzanine', 'aquarium'] }],
    },
  ],
}

/** Clues about nobody in particular, shown above the cast. */
export const GENERAL_CLUES: Clue<GlobalRule>[] = [
  {
    text: 'Deux personnes jouaient au baby-foot',
    rules: [{ type: 'nearCount', kinds: ['foosball'], count: 2 }],
  },
  { text: 'Deux zones seulement étaient vides', rules: [{ type: 'emptyZones', count: 2 }] },
  {
    text: 'Deux personnes seulement étaient près de plantes',
    rules: [{ type: 'nearCount', kinds: [...PLANTS], count: 2 }],
  },
  {
    text: 'Il n’y avait qu’une personne dans le Grand open space',
    rules: [{ type: 'zoneCount', zone: 'large-open-space', count: 1 }],
  },
  {
    text: 'Le chef n’était pas dans son bureau',
    rules: [
      {
        type: 'person',
        person: 'francois',
        rule: { type: 'notInZone', zones: ['boss-office'] },
      },
    ],
  },
]
