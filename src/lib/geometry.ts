import type { Cell } from '@/lib/grid'

/** Size of a grid cell in SVG units. */
export const CELL = 48

/** Column letter shown around the map: 0 is A. */
export const columnName = (col: number) => String.fromCharCode(65 + col)

/** Map coordinate of a cell, as shown around the map: row 0, column 0 is A1. */
export const cellName = ({ row, col }: { row: number; col: number }) =>
  `${columnName(col)}${row + 1}`

/** Parses a map coordinate such as "B3" into a cell (row 2, column 1). */
export const parseCellName = (name: string): Cell => {
  const match = /^([A-Z])(\d+)$/.exec(name)
  if (!match) throw new Error(`Invalid cell name "${name}"`)
  return { row: Number(match[2]) - 1, col: match[1]!.charCodeAt(0) - 65 }
}
