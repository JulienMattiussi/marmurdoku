import { isNear, type Board } from '@/lib/board'
import type { Cell } from '@/lib/grid'
import {
  CRIME_SCENE_TEXT,
  globalRuleStatus,
  crimeSceneStatus,
  personRuleStatus,
  type Clue,
  type GlobalRule,
  type PersonRule,
  type Placements,
  type RuleStatus,
} from '@/lib/rules'

export interface Puzzle {
  board: Board
  people: string[]
  clues: Record<string, Clue<PersonRule>[]>
  general: Clue<GlobalRule>[]
}

/** Broken wins over open, open over ok. */
const worst = (statuses: RuleStatus[]): RuleStatus =>
  statuses.includes('broken') ? 'broken' : statuses.includes('open') ? 'open' : 'ok'

/** A clue as the player reads it: its text, and whose card it is on (none for a general clue). */
export interface ClueRef {
  person?: string
  text: string
}

/**
 * Each clue on these placements, the murder first, then the general clues,
 * then each person's. A clue told in parts is checked part by part.
 */
const clueStatuses = (puzzle: Puzzle, placements: Placements) => {
  const { board, people, clues, general } = puzzle
  const split = <R>(
    person: string | undefined,
    { text, rules, parts }: Clue<R>,
    status: (rule: R) => RuleStatus,
  ) =>
    parts
      ? rules.map((rule, i) => ({ person, text: parts[i]!, status: status(rule) }))
      : [{ person, text, status: worst(rules.map(status)) }]
  return [
    {
      person: undefined,
      text: CRIME_SCENE_TEXT,
      status: crimeSceneStatus(placements, board, people),
    },
    ...general.flatMap((clue) =>
      split(undefined, clue, (rule) => globalRuleStatus(rule, placements, board, people)),
    ),
    ...Object.entries(clues).flatMap(([person, list]) =>
      list.flatMap((clue) =>
        split(person, clue, (rule) => personRuleStatus(rule, person, placements, board, people)),
      ),
    ),
  ]
}

/** Every rule of the puzzle on these placements: broken wins over open, open over ok. */
export const puzzleStatus = (puzzle: Puzzle, placements: Placements) =>
  worst(clueStatuses(puzzle, placements).map(({ status }) => status))

/** The clues these placements break, in the order of `clueStatuses`. */
export const brokenClues = (puzzle: Puzzle, placements: Placements): ClueRef[] =>
  clueStatuses(puzzle, placements)
    .filter(({ status }) => status === 'broken')
    .map(({ person, text }) => ({ person, text }))

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
 * The cells each person can stand on, judged by their own clues alone (and
 * the general clues about them), before anyone is placed.
 */
export const ownCells = (puzzle: Puzzle): Map<string, Cell[]> => {
  const { board, people, clues } = puzzle
  const globalRules = puzzle.general.flatMap(({ rules }) => rules)
  return new Map(
    people.map((id) => {
      const rules = [
        ...(clues[id] ?? []).flatMap((clue) => clue.rules),
        ...globalRules.flatMap((rule) =>
          rule.type === 'person' && rule.person === id ? [rule.rule] : [],
        ),
      ]
      const cells: Cell[] = []
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          if (!board.placeable[row]![col]) continue
          const alone = { [id]: { row, col } }
          const fits = rules.every(
            (rule) => personRuleStatus(rule, id, alone, board, people) !== 'broken',
          )
          if (fits) cells.push({ row, col })
        }
      }
      return [id, cells]
    }),
  )
}

/**
 * Finds solutions, at most `limit` of them and until `deadline` (a
 * performance.now() time): one person per row and per column, on placeable
 * cells, every rule holding. Two are enough to tell that the clues are not
 * sufficient yet.
 *
 * Each person starts with the cells their own clues allow. The search then
 * places the person with the fewest cells left, and cuts a branch as soon as:
 * someone has no cell left; the remaining people can no longer each get a row
 * and a column of their own; a room rule (alone, with exactly N people, not
 * alone) can no longer hold; or a counting clue (rooms left empty,
 * people near something) can no longer reach its count. Every complete
 * placement is checked against all the rules (puzzleStatus).
 */
export const solve = (puzzle: Puzzle, limit = 2, deadline = Infinity): Placements[] => {
  const { board, people, clues } = puzzle
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

  const own = ownCells(puzzle)
  const domains = people.map((id) => own.get(id)!.map(({ row, col }) => row * size + col))

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
      const company = links[q]!.roomWith
      if (company && (!company.among.has(p) || here.length > company.count)) return false
    }
    const own = links[p]!.roomWith
    if (own && (here.length >= own.count + 1 || here.some((q) => !own.among.has(q)))) return false
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
    if (solutions.length >= limit || performance.now() > deadline) return
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
