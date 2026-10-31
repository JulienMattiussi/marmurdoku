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

/** "Near" in the clues: one of the neighboring cells holds one of these kinds. */
export const isNear = (board: Board, cell: Cell, kinds: FurnitureKind[]) =>
  neighbors(cell, board.size).some(({ row, col }) =>
    board.kinds[row]![col]!.some((kind) => kinds.includes(kind)),
  )
