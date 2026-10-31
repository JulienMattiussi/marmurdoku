import type { Furniture } from '@/lib/furniture'

/**
 * The Marmelab offices on a 20x20 grid, redrawn from the Marmemap Tiled map.
 * Rows 0-2 are the upper floor: each mezzanine sits right above the columns of
 * the room it overlooks, the rest is the void over the open space. Codes are
 * defined in zones.ts.
 */
export const ZONE_GRID = [
  '1111.......2222222..',
  '1111.......2222222..',
  '1111.......2222222..',
  'BBBBOOOOOOOPPPPPPPMM',
  'BBBBOOOOOOOPPPPPPPMM',
  'BBBBOOOOOOOPPPPPPPMM',
  'BBBBOOOOOOOPPPPPPPMM',
  'WWCCOOOOOOOPPPPPPPMM',
  'WWCCOOOOOOOCCCCCCCMM',
  'CCCCCCCCCCCCCCCCCCMM',
  'LLDDDDDKKKKKKMMMMMMM',
  'LLDDDDDKKKKKKMMMMMMM',
  'LLRRRRRKKKKKKMMMMMMM',
  'SSRRRRRKKKKKKMMMMMMM',
  'SSRRRRRKKKKKKMMMMMMM',
  'SSRRRRRKKKKKKMMMMMMM',
  'SSRRRRRKKKKKKMMMMMMM',
  'YYYYYYYYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYYYYYYYY',
]

export const FURNITURE: Furniture[] = [
  // Mezzanine
  { kind: 'synth', row: 0, col: 0, width: 2 },
  { kind: 'chair', row: 1, col: 1, facing: 'north' },
  { kind: 'bed', row: 2, col: 0, width: 2 },
  { kind: 'stairs', row: 2, col: 3, facing: 'south' },
  // Aquarium
  { kind: 'plainDesk', row: 1, col: 12, width: 3 },
  { kind: 'chair', row: 0, col: 12, facing: 'south' },
  { kind: 'chair', row: 0, col: 14, facing: 'south' },
  { kind: 'chair', row: 2, col: 12, facing: 'north' },
  { kind: 'chair', row: 2, col: 14, facing: 'north' },
  { kind: 'tv', row: 1, col: 11, facing: 'east' },
  { kind: 'stairs', row: 2, col: 17, facing: 'south' },
  // Bureau du chef
  { kind: 'rug', row: 4, col: 0, width: 2, height: 3, tone: 'grey' },
  { kind: 'printer', row: 3, col: 0, facing: 'east' },
  { kind: 'stairs', row: 4, col: 3, facing: 'north' },
  { kind: 'chair', row: 4, col: 1, facing: 'south' },
  { kind: 'desk', row: 5, col: 0, facing: 'south', joins: ['east'] },
  { kind: 'plainDesk', row: 5, col: 1, joins: ['west'] },
  { kind: 'chair', row: 6, col: 0, facing: 'north' },
  { kind: 'shelf', row: 5, col: 3, facing: 'west' },
  // WC
  { kind: 'toilet', row: 7, col: 0, facing: 'east' },
  // Grand open space: a four-desk island and a six-desk one
  { kind: 'desk', row: 6, col: 4, width: 2, height: 2 },
  { kind: 'chair', row: 5, col: 4, facing: 'south' },
  { kind: 'chair', row: 5, col: 5, facing: 'south' },
  { kind: 'chair', row: 8, col: 4, facing: 'north' },
  { kind: 'chair', row: 8, col: 5, facing: 'north' },
  { kind: 'plant', row: 6, col: 6 },
  { kind: 'desk', row: 6, col: 8, width: 3, height: 2 },
  { kind: 'chair', row: 5, col: 8, facing: 'south' },
  { kind: 'chair', row: 5, col: 10, facing: 'south' },
  { kind: 'chair', row: 8, col: 8, facing: 'north' },
  { kind: 'chair', row: 8, col: 10, facing: 'north' },
  { kind: 'facingDesk', row: 3, col: 7, facing: 'east' },
  { kind: 'chair', row: 3, col: 6, facing: 'east' },
  { kind: 'chair', row: 3, col: 8, facing: 'west' },
  // Petit open space
  { kind: 'desk', row: 4, col: 13, width: 4, height: 2 },
  { kind: 'chair', row: 3, col: 14, facing: 'south' },
  { kind: 'chair', row: 3, col: 16, facing: 'south' },
  { kind: 'chair', row: 6, col: 14, facing: 'north' },
  { kind: 'chair', row: 6, col: 16, facing: 'north' },
  { kind: 'plant', row: 7, col: 11 },
  { kind: 'extinguisher', row: 4, col: 17 },
  { kind: 'stairs', row: 5, col: 17, facing: 'north' },
  // Couloir
  { kind: 'sink', row: 9, col: 0, facing: 'east' },
  { kind: 'extinguisher', row: 8, col: 11 },
  { kind: 'desk', row: 8, col: 14, facing: 'south' },
  // Communs: the big staircase runs west from R11-R12, turns on the landing, ends at N17-O17
  { kind: 'stairs', row: 10, col: 15, width: 3, height: 2, facing: 'west', joins: ['west'] },
  { kind: 'landing', row: 10, col: 13, width: 2, height: 2, joins: ['east', 'south'] },
  { kind: 'stairs', row: 12, col: 13, width: 2, height: 5, facing: 'south', joins: ['north'] },
  // Salle de call
  { kind: 'plainDesk', row: 11, col: 0, facing: 'south' },
  { kind: 'chair', row: 12, col: 0, facing: 'north' },
  // Salle de bain
  { kind: 'shower', row: 13, col: 0, width: 2 },
  { kind: 'toilet', row: 14, col: 1, facing: 'south' },
  { kind: 'sink', row: 15, col: 0, facing: 'east' },
  // Dressing
  { kind: 'shelf', row: 11, col: 2, width: 3, facing: 'north' },
  // Salle de pause
  { kind: 'plant', row: 12, col: 2 },
  { kind: 'tv', row: 13, col: 2, facing: 'east' },
  { kind: 'sofa', row: 12, col: 4, height: 2, facing: 'west' },
  { kind: 'rug', row: 14, col: 3, width: 4, height: 3 },
  { kind: 'foosball', row: 15, col: 4, width: 2 },
  // Cuisine
  { kind: 'counter', row: 10, col: 7, joins: ['east'] },
  { kind: 'kitchenSink', row: 10, col: 8, joins: ['west', 'east'] },
  { kind: 'coffeeMaker', row: 10, col: 9, joins: ['west', 'east'] },
  { kind: 'hob', row: 10, col: 10, joins: ['west', 'east'] },
  { kind: 'counter', row: 10, col: 11, joins: ['west', 'south'] },
  { kind: 'counter', row: 11, col: 11, height: 2, joins: ['north'] },
  { kind: 'fridge', row: 11, col: 7, facing: 'east' },
  { kind: 'tv', row: 13, col: 7, facing: 'east' },
  { kind: 'stool', row: 12, col: 8 },
  { kind: 'stool', row: 13, col: 9 },
  { kind: 'stool', row: 13, col: 10 },
  { kind: 'bar', row: 12, col: 9, width: 2 },
  { kind: 'table', row: 15, col: 9, width: 3 },
  { kind: 'chair', row: 14, col: 9, facing: 'south' },
  { kind: 'chair', row: 14, col: 10, facing: 'south' },
  { kind: 'chair', row: 14, col: 11, facing: 'south' },
  { kind: 'chair', row: 16, col: 9, facing: 'north' },
  { kind: 'chair', row: 16, col: 10, facing: 'north' },
  { kind: 'chair', row: 16, col: 11, facing: 'north' },
  { kind: 'chair', row: 15, col: 8, facing: 'east' },
  { kind: 'chair', row: 15, col: 12, facing: 'west' },
  // Cour
  { kind: 'flowerBed', row: 17, col: 8, width: 5 },
  { kind: 'bike', row: 18, col: 7, facing: 'north' },
  { kind: 'bike', row: 18, col: 8, facing: 'north' },
  { kind: 'bike', row: 19, col: 7, facing: 'south' },
  { kind: 'bike', row: 19, col: 8, facing: 'south' },
  { kind: 'car', row: 17, col: 2, width: 2, height: 3, facing: 'north', tone: 'blue' },
  { kind: 'car', row: 17, col: 4, width: 2, height: 3, facing: 'north', tone: 'grey' },
]
