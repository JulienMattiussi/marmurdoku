import type { Cell, Zone } from '@/lib/grid'

/** Parses a map coordinate such as "B3" into a cell (row 2, column 1). */
export const parseCellName = (name: string): Cell => {
  const match = /^([A-Z])(\d+)$/.exec(name)
  if (!match) throw new Error(`Invalid cell name "${name}"`)
  return { row: Number(match[2]) - 1, col: match[1]!.charCodeAt(0) - 65 }
}

/**
 * Every rule a solution breaks, in French, ready to show in debug mode: one
 * person per row and per column, only on placeable cells, and the murderer
 * alone with the victim in their room.
 */
export const solutionProblems = (
  placements: Record<string, Cell>,
  zones: (Zone | null)[][],
  placeable: boolean[][],
  victim: string,
  murderer: string,
): string[] => {
  const problems: string[] = []
  const entries = Object.entries(placements)
  for (const axis of ['row', 'col'] as const) {
    const label = axis === 'row' ? 'ligne' : 'colonne'
    for (let i = 0; i < zones.length; i++) {
      const count = entries.filter(([, cell]) => cell[axis] === i).length
      if (count !== 1) problems.push(`${count} personne(s) sur la ${label} ${i + 1}`)
    }
  }
  for (const [id, { row, col }] of entries) {
    if (!placeable[row]?.[col]) problems.push(`${id} est sur une case non plaçable`)
  }
  const roomOf = (id: string) => {
    const cell = placements[id]
    return cell ? zones[cell.row]?.[cell.col] : undefined
  }
  const room = roomOf(victim)
  if (!room || roomOf(murderer) !== room) {
    problems.push('le meurtrier n’est pas dans la pièce de la victime')
  } else {
    const others = entries.filter(([id]) => id !== victim && id !== murderer && roomOf(id) === room)
    if (others.length) problems.push(`${others.length} autre(s) personne(s) avec la victime`)
  }
  return problems
}
