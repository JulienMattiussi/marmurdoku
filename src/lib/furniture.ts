import type { Cell, Zone } from '@/lib/grid'

/**
 * Every piece of furniture of the level. Seats and floor coverings can hold a
 * person (they sit or stand on them); everything else blocks its cells.
 * `sprite` names the component that draws the kind (components/furniture/).
 */
export const FURNITURE_KINDS = {
  chair: { label: 'chaise', occupiable: true, sprite: 'seat' },
  stool: { label: 'tabouret', occupiable: true, sprite: 'seat' },
  sofa: { label: 'canapé', occupiable: true, sprite: 'seat' },
  bed: { label: 'lit', occupiable: true, sprite: 'seat' },
  rug: { label: 'tapis', occupiable: true, sprite: 'table' },
  toilet: { label: 'toilettes', occupiable: true, sprite: 'seat' },
  shower: { label: 'douche', occupiable: true, sprite: 'table' },
  desk: { label: 'table', occupiable: false, sprite: 'table' },
  facingDesk: { label: 'table', occupiable: false, sprite: 'table' },
  plainDesk: { label: 'table', occupiable: false, sprite: 'table' },
  table: { label: 'table', occupiable: false, sprite: 'table' },
  counter: { label: 'plan de travail', occupiable: false, sprite: 'table' },
  coffeeMaker: { label: 'cafetière', occupiable: false, sprite: 'table' },
  hob: { label: 'plaque de cuisson', occupiable: false, sprite: 'table' },
  kitchenSink: { label: 'évier', occupiable: false, sprite: 'table' },
  bar: { label: 'comptoir', occupiable: false, sprite: 'table' },
  fridge: { label: 'frigo', occupiable: false, sprite: 'decor' },
  shelf: { label: 'étagère', occupiable: false, sprite: 'decor' },
  synth: { label: 'synthé', occupiable: false, sprite: 'decor' },
  car: { label: 'voiture', occupiable: false, sprite: 'decor' },
  mailbox: { label: 'boîtes aux lettres', occupiable: false, sprite: 'decor' },
  printer: { label: 'imprimante', occupiable: false, sprite: 'decor' },
  flowerBed: { label: 'plante', occupiable: false, sprite: 'decor' },
  plant: { label: 'plante', occupiable: false, sprite: 'decor' },
  sink: { label: 'lavabo', occupiable: false, sprite: 'decor' },
  extinguisher: { label: 'extincteur', occupiable: false, sprite: 'decor' },
  bike: { label: 'vélo', occupiable: false, sprite: 'decor' },
  foosball: { label: 'baby-foot', occupiable: false, sprite: 'decor' },
  tv: { label: 'télé', occupiable: false, sprite: 'decor' },
  landing: { label: 'palier', occupiable: false, sprite: 'decor' },
  stairs: { label: 'escalier', occupiable: false, sprite: 'decor' },
} as const

export type FurnitureKind = keyof typeof FURNITURE_KINDS

export type Tone = 'green' | 'grey' | 'blue'

export type Facing = 'north' | 'south' | 'east' | 'west'

export interface Furniture extends Cell {
  kind: FurnitureKind
  /** Size in cells, 1 by default. */
  width?: number
  height?: number
  /**
   * Side the piece opens to: where a seat's sitter looks, where a desk's user
   * sits. For stairs, the way the arrow points.
   */
  facing?: Facing
  /** Desks: cells ("O6") that keep a screen even with no seat in front. */
  screens?: string[]
  /** Sides drawn flush with the next piece of the same structure (stairs, landings, desks). */
  joins?: Facing[]
  /** Color variant, for rugs and cars; each sprite falls back to its own default. */
  tone?: Tone
}

export const furnitureCells = ({ row, col, width = 1, height = 1 }: Furniture): Cell[] =>
  Array.from({ length: width * height }, (_, i) => ({
    row: row + Math.floor(i / width),
    col: col + (i % width),
  }))

/**
 * Whether each cell can hold a person: inside a room and not covered by a
 * blocking piece. A rug under a foosball table still blocks.
 */
export const occupancyGrid = (inRoom: boolean[][], furniture: Furniture[]): boolean[][] => {
  const grid = inRoom.map((row) => [...row])
  for (const piece of furniture) {
    if (FURNITURE_KINDS[piece.kind].occupiable) continue
    for (const { row, col } of furnitureCells(piece)) {
      const line = grid[row]
      if (line) line[col] = false
    }
  }
  return grid
}

/**
 * Where each map side lands once a sprite is drawn facing south: the piece is
 * turned afterwards, so a side given on the map must be turned the other way.
 */
const TO_SPRITE: Record<Facing, Record<Facing, Facing>> = {
  south: { north: 'north', east: 'east', south: 'south', west: 'west' },
  north: { north: 'south', east: 'west', south: 'north', west: 'east' },
  west: { north: 'west', east: 'north', south: 'east', west: 'south' },
  east: { north: 'east', east: 'south', south: 'west', west: 'north' },
}

export const spriteSides = (sides: Facing[], facing: Facing = 'south'): Facing[] =>
  sides.map((side) => TO_SPRITE[facing][side])

const STEP: Record<Facing, [number, number]> = {
  north: [-1, 0],
  south: [1, 0],
  east: [0, 1],
  west: [0, -1],
}

/**
 * For each cell of a desk (row by row), whether it gets a screen: a seat
 * stands next to it on its user's side, turned toward the desk; or the desk
 * lists the cell in `screens`. Islands two cells high seat people
 * north and south; any other desk on the side it faces.
 */
export const seatedCells = (desk: Furniture, furniture: Furniture[]): boolean[] => {
  const OPPOSITE: Record<Facing, Facing> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
  }
  // Seats by cell, with the way they face (none: any way).
  const seats = new Map(
    furniture
      .filter((piece) => FURNITURE_KINDS[piece.kind].sprite === 'seat')
      .flatMap((piece) =>
        furnitureCells(piece).map((cell) => [`${cell.row},${cell.col}`, piece.facing]),
      ),
  )
  const forced = new Set(desk.screens ?? [])
  return furnitureCells(desk).map(({ row, col }) => {
    if (forced.has(`${String.fromCharCode(65 + col)}${row + 1}`)) return true
    const side =
      desk.height === 2 ? (row === desk.row ? 'north' : 'south') : (desk.facing ?? 'south')
    const [dr, dc] = STEP[side]
    const key = `${row + dr},${col + dc}`
    if (!seats.has(key)) return false
    // A seat turned away from the desk does not count.
    const facing = seats.get(key)
    return !facing || facing === OPPOSITE[side]
  })
}

/** Cells that can hold a person on the map: in a room, and free or on a seat. */
export const placeableGrid = (zones: (Zone | null)[][], furniture: Furniture[]): boolean[][] =>
  occupancyGrid(
    zones.map((row) => row.map(Boolean)),
    furniture,
  )
