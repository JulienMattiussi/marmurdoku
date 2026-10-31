import type { Zone } from '@/lib/grid'

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  /**
   * wall: between rooms; fence: between two outdoor spaces; railing: edge of a
   * mezzanine over the void; floor: cut line between the upper and ground floors.
   */
  style: 'wall' | 'fence' | 'railing' | 'floor'
}

const OUTDOOR = new Set(['concrete', 'paving'])
const isOutdoor = (zone: Zone | null) => !!zone && OUTDOOR.has(zone.floor)
const isUpper = (zone: Zone | null) => zone?.level === 'upper'

const boundaryStyle = (a: Zone | null, b: Zone | null): Segment['style'] => {
  if (!a || !b) return 'railing'
  if (isUpper(a) !== isUpper(b)) return 'floor'
  return isOutdoor(a) && isOutdoor(b) ? 'fence' : 'wall'
}

/**
 * Boundaries between cells of different zones, in cell units; null is the
 * void. Outer edges get no segment: the map frame draws them.
 */
export const zoneBoundaries = (zones: (Zone | null)[][]): Segment[] => {
  const segments: Segment[] = []
  const style = boundaryStyle
  zones.forEach((row, r) =>
    row.forEach((zone, c) => {
      const right = row[c + 1]
      if (right !== undefined && right !== zone && (zone || right)) {
        segments.push({ x1: c + 1, y1: r, x2: c + 1, y2: r + 1, style: style(zone, right) })
      }
      const below = zones[r + 1]?.[c]
      if (below !== undefined && below !== zone && (zone || below)) {
        segments.push({ x1: c, y1: r + 1, x2: c + 1, y2: r + 1, style: style(zone, below) })
      }
    }),
  )
  return segments
}
