/** Size of a grid cell in SVG units. */
export const CELL = 48

/** Column letter shown around the map: 0 is A. */
export const columnName = (col: number) => String.fromCharCode(65 + col)

/** Map coordinate of a cell, as shown around the map: row 0, column 0 is A1. */
export const cellName = ({ row, col }: { row: number; col: number }) =>
  `${columnName(col)}${row + 1}`
