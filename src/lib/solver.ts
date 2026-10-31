import { isNear, type Board } from '@/lib/board'
import type { Cell } from '@/lib/grid'
import {
  globalRuleStatus,
  murderStatus,
  personRuleStatus,
  type Clue,
  type GlobalRule,
  type PersonRule,
  type Placements,
} from '@/lib/rules'

export interface Puzzle {
  board: Board
  people: string[]
  victim: string
  murderer: string
  clues: Record<string, Clue<PersonRule>[]>
  general: Clue<GlobalRule>[]
}

/** Every rule of the puzzle on these placements: broken wins over open, open over ok. */
export const puzzleStatus = (puzzle: Puzzle, placements: Placements) => {
  const { board, people, victim, murderer, clues, general } = puzzle
  const statuses = [
    murderStatus(victim, murderer, placements, board, people),
    ...general.flatMap(({ rules }) =>
      rules.map((rule) => globalRuleStatus(rule, placements, board, people)),
    ),
    ...Object.entries(clues).flatMap(([person, list]) =>
      list.flatMap(({ rules }) =>
        rules.map((rule) => personRuleStatus(rule, person, placements, board, people)),
      ),
    ),
  ]
  return statuses.includes('broken') ? 'broken' : statuses.includes('open') ? 'open' : 'ok'
}

/** Per-person rules the search applies itself, beyond the cells each person may stand on. */
interface Links {
  alone: boolean
  company: boolean
  roomWith?: { count: number; among: Set<number> }
  sameZone: number[]
  columnGaps: { other: number; gap: number }[]
  /** People this one stands above (-1) or below (1), by exactly `rows` if set. */
  rowOrder: { other: number; side: number; rows?: number }[]
}

/**
 * Bipartite matching: can every person still get a line (row or column) of
 * their own? `lines[p]` lists the lines person p can reach.
 */
const hasMatching = (lines: number[][]) => {
  const owner = new Map<number, number>()
  const tryAssign = (p: number, seen: Set<number>): boolean => {
    for (const line of lines[p]!) {
      if (seen.has(line)) continue
      seen.add(line)
      const current = owner.get(line)
      if (current === undefined || tryAssign(current, seen)) {
        owner.set(line, p)
        return true
      }
    }
    return false
  }
  return lines.every((_, p) => tryAssign(p, new Set()))
}

/**
 * Finds solutions, at most `limit` of them: one person per row and per
 * column, on placeable cells, every rule holding. Two are enough to tell that
 * the clues are not sufficient yet.
 *
 * Each person starts with the cells their own clues allow. The search then
 * places the person with the fewest cells left, and cuts a branch as soon as:
 * someone has no cell left; the remaining people can no longer each get a row
 * and a column of their own; a room rule (alone, with exactly N people, not
 * alone, the murder) can no longer hold; or a counting clue (rooms left empty,
 * people near something) can no longer reach its count. Every complete
 * placement is checked against all the rules (puzzleStatus).
 */
export const solve = (puzzle: Puzzle, limit = 2): Placements[] => {
  const { board, people, clues, victim, murderer } = puzzle
  const size = board.size
  const n = people.length
  const index = new Map(people.map((id, i) => [id, i]))
  const zoneIds = [...new Set(board.zones.flat().flatMap((zone) => (zone ? [zone.id] : [])))]
  const zoneOfCell = board.zones.flat().map((zone) => (zone ? zoneIds.indexOf(zone.id) : -1))
  const rowOf = (cell: number) => Math.floor(cell / size)
  const colOf = (cell: number) => cell % size
  const toCell = (cell: number): Cell => ({ row: rowOf(cell), col: colOf(cell) })

  // Rules per person, global clues about one person included.
  const globalRules = puzzle.general.flatMap(({ rules }) => rules)
  const rulesOf = people.map((id) => [
    ...(clues[id] ?? []).flatMap(({ rules }) => rules),
    ...globalRules.flatMap((rule) =>
      rule.type === 'person' && rule.person === id ? [rule.rule] : [],
    ),
  ])

  const domains = people.map((id, p) => {
    const cells: number[] = []
    for (let cell = 0; cell < size * size; cell++) {
      if (!board.placeable[rowOf(cell)]![colOf(cell)]) continue
      const alone = { [id]: toCell(cell) }
      const fits = rulesOf[p]!.every(
        (rule) => personRuleStatus(rule, id, alone, board, people) !== 'broken',
      )
      if (fits) cells.push(cell)
    }
    return cells
  })

  const links: Links[] = people.map(() => ({
    alone: false,
    company: false,
    sameZone: [],
    columnGaps: [],
    rowOrder: [],
  }))
  rulesOf.forEach((rules, p) => {
    for (const rule of rules) {
      if (rule.type === 'alone') links[p]!.alone = true
      if (rule.type === 'notAlone') links[p]!.company = true
      if (rule.type === 'roomWith') {
        links[p]!.roomWith = {
          count: rule.count,
          among: new Set(rule.among.map((id) => index.get(id)!)),
        }
      }
      if (rule.type === 'sameZoneAs') {
        const q = index.get(rule.person)!
        links[p]!.sameZone.push(q)
        links[q]!.sameZone.push(p)
      }
      if (rule.type === 'above') {
        const q = index.get(rule.person)!
        links[p]!.rowOrder.push({ other: q, side: -1, rows: rule.rows })
        links[q]!.rowOrder.push({ other: p, side: 1, rows: rule.rows })
      }
      if (rule.type === 'columnGap') {
        const q = index.get(rule.person)!
        links[p]!.columnGaps.push({ other: q, gap: rule.gap })
        links[q]!.columnGaps.push({ other: p, gap: rule.gap })
      }
    }
  })
  const pair = new Set([index.get(victim)!, index.get(murderer)!])
  const nearRules = globalRules.flatMap((rule) =>
    rule.type === 'nearCount'
      ? [
          {
            count: rule.count,
            near: zoneOfCell.map((_, c) => isNear(board, toCell(c), rule.kinds)),
          },
        ]
      : [],
  )
  const emptyRule = globalRules.find((rule) => rule.type === 'emptyZones')
  // Rooms holding a set number of people.
  const zoneLimits = new Map(
    globalRules.flatMap((rule) =>
      rule.type === 'zoneCount' ? [[zoneIds.indexOf(rule.zone), rule.count] as const] : [],
    ),
  )
  const roomsToFill = emptyRule ? zoneIds.length - emptyRule.count : 0

  const position = new Array<number>(n).fill(-1)
  let rowsUsed = 0
  let colsUsed = 0
  const solutions: Placements[] = []

  /** Can person p stand on this cell, given who is placed? */
  const allowed = (p: number, cell: number, occupants: number[][]) => {
    if (rowsUsed & (1 << rowOf(cell)) || colsUsed & (1 << colOf(cell))) return false
    const zone = zoneOfCell[cell]!
    const here = occupants[zone]!
    if (links[p]!.alone && here.length) return false
    if (here.length >= (zoneLimits.get(zone) ?? Infinity)) return false
    for (const q of here) {
      if (links[q]!.alone) return false
      if (pair.has(q) !== pair.has(p)) return false
      const company = links[q]!.roomWith
      if (company && (!company.among.has(p) || here.length > company.count)) return false
    }
    const own = links[p]!.roomWith
    if (own && (here.length >= own.count + 1 || here.some((q) => !own.among.has(q)))) return false
    if (pair.has(p)) {
      for (const q of pair) {
        if (q !== p && position[q]! >= 0 && zoneOfCell[position[q]!] !== zone) return false
      }
    }
    for (const q of links[p]!.sameZone) {
      if (position[q]! >= 0 && zoneOfCell[position[q]!] !== zone) return false
    }
    for (const { other, side, rows } of links[p]!.rowOrder) {
      if (position[other]! < 0) continue
      const gap = rowOf(cell) - rowOf(position[other]!)
      if (Math.sign(gap) !== side || (rows && Math.abs(gap) !== rows)) return false
    }
    for (const { other, gap } of links[p]!.columnGaps) {
      if (position[other]! >= 0 && Math.abs(colOf(position[other]!) - colOf(cell)) !== gap) {
        return false
      }
    }
    return true
  }

  const search = (): void => {
    if (solutions.length >= limit) return
    const occupants = zoneIds.map((): number[] => [])
    position.forEach((cell, p) => {
      if (cell >= 0) occupants[zoneOfCell[cell]!]!.push(p)
    })
    const left = people.flatMap((_, p) => (position[p]! < 0 ? [p] : []))
    if (!left.length) {
      const placements = Object.fromEntries(people.map((id, p) => [id, toCell(position[p]!)]))
      if (puzzleStatus(puzzle, placements) === 'ok') solutions.push(placements)
      return
    }

    const options = left.map((p) => domains[p]!.filter((cell) => allowed(p, cell, occupants)))
    if (options.some((cells) => !cells.length)) return
    if (!hasMatching(options.map((cells) => [...new Set(cells.map(rowOf))]))) return
    if (!hasMatching(options.map((cells) => [...new Set(cells.map(colOf))]))) return

    const reachable = (zone: number, among?: Set<number>) =>
      left.filter(
        (p, i) => (!among || among.has(p)) && options[i]!.some((c) => zoneOfCell[c] === zone),
      ).length
    // Room rules waiting for people still to come.
    for (let p = 0; p < n; p++) {
      const cell = position[p]!
      if (cell < 0) continue
      const zone = zoneOfCell[cell]!
      const others = occupants[zone]!.length - 1
      if (links[p]!.company && !others && !reachable(zone)) return
      const own = links[p]!.roomWith
      if (own && others < own.count && reachable(zone, own.among) < own.count - others) return
    }
    if (pair.size === 2) {
      const placedPair = [...pair].filter((p) => position[p]! >= 0)
      if (placedPair.length === 1) {
        const zone = zoneOfCell[position[placedPair[0]!]!]!
        const partner = [...pair].find((p) => position[p]! < 0)!
        if (!options[left.indexOf(partner)]!.some((c) => zoneOfCell[c] === zone)) return
      }
    }
    for (const [zone, count] of zoneLimits) {
      if (count - occupants[zone]!.length > reachable(zone)) return
    }
    // Counting clues.
    const occupied = occupants.filter((list) => list.length).length
    const missing = roomsToFill - occupied
    if (emptyRule && occupied > roomsToFill) return
    if (missing > 0) {
      const open = new Set(
        options
          .flat()
          .map((c) => zoneOfCell[c]!)
          .filter((z) => !occupants[z]!.length),
      )
      if (missing > left.length || missing > open.size) return
    }
    for (const { count, near } of nearRules) {
      const placedNear = position.filter((cell) => cell >= 0 && near[cell]).length
      const canBeNear = options.filter((cells) => cells.some((c) => near[c])).length
      if (placedNear > count || placedNear + canBeNear < count) return
    }

    // Most constrained person first.
    let best = 0
    options.forEach((cells, i) => {
      if (cells.length < options[best]!.length) best = i
    })
    const p = left[best]!
    for (const cell of options[best]!) {
      position[p] = cell
      rowsUsed |= 1 << rowOf(cell)
      colsUsed |= 1 << colOf(cell)
      search()
      position[p] = -1
      rowsUsed &= ~(1 << rowOf(cell))
      colsUsed &= ~(1 << colOf(cell))
      if (solutions.length >= limit) return
    }
  }
  search()
  return solutions
}
