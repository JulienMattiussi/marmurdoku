import { WOMEN } from '@/data/people'
import type { Clue, GlobalRule, PersonRule } from '@/lib/rules'

/**
 * What the player knows, each clue as shown (`text`) and as checked by the
 * solver and the game (`rule`, rows and columns counted from 0). Keep the two
 * in step. Wording rules: a "table" is any table or desk; "plants" include
 * the flower bed of the yard (these two are not told to the player); "à côté
 * de" (never "près de", kept for "plus près") means on a neighboring cell (up, down, left or right) of the same room;
 * "with someone" means in the same room (both told in RulesDialog.vue).
 */
const PLANTS = ['plant', 'flowerBed'] as const
/** What one sits on ("était assis"), as RulesDialog.vue tells the player. */
const SEATS = ['chair', 'stool', 'sofa'] as const

export const CLUES: Record<string, Clue<PersonRule>[]> = {
  adrieng: [
    {
      text: 'était assis',
      rules: [{ type: 'onFurniture', kinds: [...SEATS] }],
    },
  ],
  alexandra: [
    { text: 'était à côté d’un escalier', rules: [{ type: 'nearFurniture', kinds: ['stairs'] }] },
  ],
  anthony: [
    {
      text: 'était juste une ligne au-dessus de Thibault',
      rules: [{ type: 'above', person: 'thibault', rows: 1 }],
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
      text: 'était à côté d’un extincteur',
      rules: [{ type: 'nearFurniture', kinds: ['extinguisher'] }],
    },
  ],
  francois: [
    {
      text: 'était sur de la moquette',
      rules: [{ type: 'onFloor', floors: ['carpet'] }],
    },
  ],
  guillaume: [
    { text: 'était à côté d’un vélo', rules: [{ type: 'nearFurniture', kinds: ['bike'] }] },
  ],
  guiom: [{ text: 'était seul', rules: [{ type: 'alone' }] }],
  jeremie: [{ text: 'était sur un tapis', rules: [{ type: 'onFurniture', kinds: ['rug'] }] }],
  jibe: [
    {
      text: 'était debout à côté d’une chaise',
      rules: [
        { type: 'notOnFurniture', kinds: [...SEATS, 'bed', 'toilet'] },
        { type: 'nearFurniture', kinds: ['chair'] },
      ],
    },
  ],
  jerome: [{ text: 'était à côté d’une télé', rules: [{ type: 'nearFurniture', kinds: ['tv'] }] }],
  julio: [
    {
      text: 'était à l’intérieur du bâtiment',
      rules: [{ type: 'notInZone', zones: ['commons', 'yard'] }],
    },
  ],
  karen: [
    {
      text: 'était plus près des boîtes aux lettres que Jibé',
      rules: [{ type: 'closerThan', kinds: ['mailbox'], person: 'jibe' }],
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
    {
      text: 'était seul avec deux femmes',
      rules: [{ type: 'roomWith', count: 2, among: WOMEN }],
    },
  ],
  sohanne: [{ text: 'était sur la ligne 16', rules: [{ type: 'inRows', rows: [15] }] }],
  thibault: [
    {
      text: 'fumait à côté d’un vélo',
      rules: [{ type: 'nearFurniture', kinds: ['bike'] }],
    },
  ],
  thiery: [
    {
      text: 'était dans une pièce en hauteur, à exactement une colonne de Karen',
      rules: [
        { type: 'inZone', zones: ['mezzanine', 'aquarium'] },
        { type: 'columnGap', person: 'karen', gap: 1 },
      ],
    },
  ],
}

/** Clues about nobody in particular, shown above the cast. */
export const GENERAL_CLUES: Clue<GlobalRule>[] = [
  {
    text: 'Deux personnes jouaient au baby-foot',
    rules: [{ type: 'nearCount', kinds: ['foosball'], count: 2 }],
  },
  {
    text: 'Deux personnes seulement étaient à côté de plantes',
    rules: [{ type: 'nearCount', kinds: [...PLANTS], count: 2 }],
  },
  {
    text: 'Il n’y avait qu’une personne dans le Grand open space',
    rules: [{ type: 'zoneCount', zone: 'large-open-space', count: 1 }],
  },
  { text: 'Deux zones seulement étaient vides', rules: [{ type: 'emptyZones', count: 2 }] },
]
