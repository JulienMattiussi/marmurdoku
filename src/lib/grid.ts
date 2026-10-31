type FloorKind =
  'carpet' | 'oak' | 'planks' | 'herringbone' | 'walnut' | 'tiles' | 'concrete' | 'paving'

export interface Zone {
  /** Single character used in the zone grid. */
  code: string
  id: string
  name: string
  floor: FloorKind
  level: 'upper' | 'ground'
}

export interface Cell {
  row: number
  col: number
}

/** Grid character for cells that belong to no room (the void over the open space). */
const VOID = '.'

/**
 * Parses the zone grid: one string per row, one character per cell. Throws on
 * ragged rows or unknown codes, so a typo in office.ts fails loudly.
 */
export const parseZoneGrid = (rows: string[], zones: Zone[]): (Zone | null)[][] => {
  const byCode = new Map(zones.map((zone) => [zone.code, zone]))
  const size = rows.length
  return rows.map((row, r) => {
    if (row.length !== size) throw new Error(`Row ${r} has ${row.length} cells, expected ${size}`)
    return [...row].map((code, c) => {
      if (code === VOID) return null
      const zone = byCode.get(code)
      if (!zone) throw new Error(`Unknown zone code "${code}" at ${r},${c}`)
      return zone
    })
  })
}
