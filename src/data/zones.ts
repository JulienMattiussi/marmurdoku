import type { Zone } from '@/lib/grid'

/**
 * The rooms of the level. `code` is the character used in ZONE_GRID
 * (office.ts); `floor` picks the floor pattern drawn under the room.
 */
export const ZONES: Zone[] = [
  { code: '1', id: 'mezzanine', name: 'Mezzanine', floor: 'carpet', level: 'upper' },
  { code: '2', id: 'aquarium', name: 'Aquarium', floor: 'carpet', level: 'upper' },
  { code: 'B', id: 'boss-office', name: 'Bureau du chef', floor: 'oak', level: 'ground' },
  { code: 'W', id: 'toilets', name: 'WC', floor: 'tiles', level: 'ground' },
  { code: 'O', id: 'large-open-space', name: 'Grand open space', floor: 'oak', level: 'ground' },
  { code: 'P', id: 'small-open-space', name: 'Petit open space', floor: 'oak', level: 'ground' },
  { code: 'C', id: 'corridor', name: 'Couloir', floor: 'planks', level: 'ground' },
  { code: 'L', id: 'call-room', name: 'Salle de call', floor: 'planks', level: 'ground' },
  { code: 'S', id: 'bathroom', name: 'Salle de bain', floor: 'tiles', level: 'ground' },
  { code: 'D', id: 'dressing', name: 'Dressing', floor: 'herringbone', level: 'ground' },
  { code: 'R', id: 'break-room', name: 'Salle de pause', floor: 'herringbone', level: 'ground' },
  { code: 'K', id: 'kitchen', name: 'Cuisine', floor: 'walnut', level: 'ground' },
  { code: 'M', id: 'commons', name: 'Communs', floor: 'concrete', level: 'ground' },
  { code: 'Y', id: 'yard', name: 'Cour', floor: 'paving', level: 'ground' },
]
