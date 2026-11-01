import { FURNITURE_KINDS, furnitureCells, type Furniture } from '@/lib/furniture'
import { cellName } from '@/lib/geometry'
import type { Cell, Zone } from '@/lib/grid'

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** What lies on each cell, as the tooltip names it: its furniture. */
export const groundLabels = (zones: (Zone | null)[][], furniture: Furniture[]) => {
  const labels = zones.map((row) => row.map((): string[] => []))
  for (const piece of furniture) {
    const label = capitalize(FURNITURE_KINDS[piece.kind].label)
    for (const { row, col } of furnitureCells(piece)) {
      const here = labels[row]![col]!
      if (!here.includes(label)) here.push(label)
    }
  }
  return labels
}

/** The tooltip of each cell: who stands there, then what lies there ("Karen · Chaise"). */
export const tooltips = (
  ground: string[][][],
  placements: Record<string, Cell>,
  nameOf: (id: string) => string,
) => {
  const names = new Map(
    Object.entries(placements).map(([id, cell]) => [cellName(cell), nameOf(id)]),
  )
  return ground.map((row, r) =>
    row.map((labels, c) =>
      [names.get(cellName({ row: r, col: c })), ...labels].filter(Boolean).join(' · '),
    ),
  )
}
