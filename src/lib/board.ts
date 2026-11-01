import { furnitureCells, placeableGrid, type Furniture, type FurnitureKind } from '@/lib/furniture'
import { parseZoneGrid, type Cell, type Zone } from '@/lib/grid'

/** Everything the rules need to know about the map, cell by cell. */
export interface Board {
  size: number
  zones: (Zone | null)[][]
  placeable: boolean[][]
  /** Furniture kinds covering each cell (a rug and the chair on it, say). */
  kinds: FurnitureKind[][][]
}

export const buildBoard = (zoneGrid: string[], zones: Zone[], furniture: Furniture[]): Board => {
  const grid = parseZoneGrid(zoneGrid, zones)
  const kinds = grid.map((row) => row.map((): FurnitureKind[] => []))
  for (const piece of furniture) {
    for (const { row, col } of furnitureCells(piece)) kinds[row]?.[col]?.push(piece.kind)
  }
  return { size: grid.length, zones: grid, placeable: placeableGrid(grid, furniture), kinds }
}

/** The up to four cells sharing a side with this one, inside the map. */
const neighbors = ({ row, col }: Cell, size: number): Cell[] =>
  [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ].filter((cell) => cell.row >= 0 && cell.row < size && cell.col >= 0 && cell.col < size)

/**
 * Distance "as the crow flies" from a cell to the closest cell holding one of
 * these kinds, center to center, in cells. Infinity if there is none.
 */
export const distanceTo = (board: Board, { row, col }: Cell, kinds: FurnitureKind[]) => {
  let best = Infinity
  board.kinds.forEach((line, r) =>
    line.forEach((here, c) => {
      if (here.some((kind) => kinds.includes(kind))) {
        best = Math.min(best, Math.hypot(r - row, c - col))
      }
    }),
  )
  return best
}

/** "Far from the walls": the four neighboring cells all belong to the same room. */
export const isAwayFromWalls = (board: Board, { row, col }: Cell) => {
  const zone = board.zones[row]![col]
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ].every(([r, c]) => board.zones[r!]?.[c!] === zone)
}

/**
 * "In a corner" of a room: the room ends both above or below the cell, and to
 * its left or right (a wall or the edge of the map on two sides that meet).
 */
export const isInCorner = (board: Board, { row, col }: Cell) => {
  const zone = board.zones[row]![col]
  const ends = (r: number, c: number) => board.zones[r]?.[c] !== zone
  return (ends(row - 1, col) || ends(row + 1, col)) && (ends(row, col - 1) || ends(row, col + 1))
}

/**
 * "Near" in the clues: a neighboring cell of the same room holds one of these
 * kinds. A piece on the other side of a wall is not near.
 */
export const isNear = (board: Board, cell: Cell, kinds: FurnitureKind[]) => {
  const zone = board.zones[cell.row]![cell.col]
  return neighbors(cell, board.size).some(
    ({ row, col }) =>
      board.zones[row]![col] === zone &&
      board.kinds[row]![col]!.some((kind) => kinds.includes(kind)),
  )
}
