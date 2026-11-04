import { isInCorner, type Board } from '@/lib/board'
import type { FurnitureKind } from '@/lib/furniture'
import type { Cell } from '@/lib/grid'
import type { GlobalRule, PersonRule, Placements } from '@/lib/rules'
import type { Puzzle } from '@/lib/solver'

/**
 * What a clue says of a place, as the map shows it while the clue is pointed
 * at: forced (green), forbidden (red), or a landmark (blue): it matters, but
 * the person does not stand on it (whatever they are next to, whatever
 * they are closer to).
 */
type Mark = 'forced' | 'forbidden' | 'landmark'

/** A place the clue names: a room or a line, framed, or furniture, filled. */
export interface Highlight {
  key: string
  mark: Mark
  shape: 'frame' | 'fill'
  cells: Cell[]
}

type Target = Omit<Highlight, 'mark'>

const cellsWhere = (board: Board, test: (row: number, col: number) => boolean): Cell[] =>
  board.zones.flatMap((line, row) =>
    line.flatMap((_, col) => (test(row, col) ? [{ row, col }] : [])),
  )

const zoneTarget = (board: Board, id: string): Target => ({
  key: `zone:${id}`,
  shape: 'frame',
  cells: cellsWhere(board, (r, c) => board.zones[r]![c]?.id === id),
})

const kindTargets = (board: Board, kinds: FurnitureKind[]): Target[] =>
  kinds.map((kind) => ({
    key: `kind:${kind}`,
    shape: 'fill',
    cells: cellsWhere(board, (r, c) => board.kinds[r]![c]!.includes(kind)),
  }))

const lineTarget = (board: Board, axis: 'row' | 'col', index: number): Target => ({
  key: `${axis}:${index}`,
  shape: 'frame',
  cells: cellsWhere(board, (r, c) => (axis === 'row' ? r : c) === index),
})

type Marked = [Target, Mark]

/** The rules that pick cells one by one (on a chair, in a corner), as a test of a cell. */
const cellTest = (
  rule: PersonRule,
  board: Board,
): ((row: number, col: number) => boolean) | null => {
  switch (rule.type) {
    case 'onFurniture':
      return (row, col) => board.kinds[row]![col]!.some((kind) => rule.kinds.includes(kind))
    case 'inCorner':
      return (row, col) => Boolean(board.zones[row]![col] && isInCorner(board, { row, col }))
    default:
      return null
  }
}

const all = (targets: Target[], mark: Mark): Marked[] => targets.map((target) => [target, mark])

/**
 * Only what can be drawn without solving anything: alone, in a room with
 * others, far from the walls mark nothing; the people a rule measures
 * against are shown apart (`clueHints`).
 */
const personMarks = (rule: PersonRule, board: Board): Marked[] => {
  switch (rule.type) {
    case 'inZone':
    case 'notInZone':
      return all(
        rule.zones.map((id) => zoneTarget(board, id)),
        rule.type === 'inZone' ? 'forced' : 'forbidden',
      )
    case 'onFurniture':
      return all(kindTargets(board, rule.kinds), 'forced')
    case 'nearFurniture':
      return all(kindTargets(board, rule.kinds), 'landmark')
    case 'notOnFurniture':
    case 'notNearFurniture':
      return all(kindTargets(board, rule.kinds), 'forbidden')
    case 'fartherThan':
    case 'closerThan':
      return all(kindTargets(board, rule.kinds), 'landmark')
    case 'inCorner':
      return [
        [
          { key: 'corners', shape: 'fill', cells: cellsWhere(board, cellTest(rule, board)!) },
          'forced',
        ],
      ]
    case 'inRows':
      return all(
        rule.rows.map((row) => lineTarget(board, 'row', row)),
        'forced',
      )
    case 'inColumns':
      return all(
        rule.cols.map((col) => lineTarget(board, 'col', col)),
        'forced',
      )
    // "Either... or...": no single option is forced.
    case 'anyOf':
      return rule.rules
        .flatMap((r) => personMarks(r, board))
        .map(([target, mark]): Marked => [target, mark === 'forced' ? 'landmark' : mark])
    default:
      return []
  }
}

const globalMarks = (rule: GlobalRule, board: Board): Marked[] => {
  switch (rule.type) {
    case 'nearCount':
      return all(kindTargets(board, rule.kinds), rule.count ? 'landmark' : 'forbidden')
    case 'zoneCount':
      return [[zoneTarget(board, rule.zone), rule.count ? 'forced' : 'forbidden']]
    case 'person':
      return personMarks(rule.rule, board)
    case 'emptyZones':
      return []
  }
}

/** One highlight per place: named both forced and forbidden (next to a chair, not on it), a landmark. */
const merge = (marked: Marked[]): Highlight[] => {
  const byKey = new Map<string, Highlight>()
  for (const [target, mark] of marked) {
    if (!target.cells.length) continue
    const known = byKey.get(target.key)
    byKey.set(target.key, { ...target, mark: known && known.mark !== mark ? 'landmark' : mark })
  }
  return [...byKey.values()]
}

export interface Edge {
  x1: number
  y1: number
  x2: number
  y2: number
}

/** The outline of a set of cells, in cell units: every side a cell of the set shares with a cell outside it. */
export const outline = (cells: Cell[]): Edge[] => {
  const inside = new Set(cells.map(({ row, col }) => `${row},${col}`))
  const has = (row: number, col: number) => inside.has(`${row},${col}`)
  return cells.flatMap(({ row: r, col: c }) => [
    ...(has(r - 1, c) ? [] : [{ x1: c, y1: r, x2: c + 1, y2: r }]),
    ...(has(r + 1, c) ? [] : [{ x1: c, y1: r + 1, x2: c + 1, y2: r + 1 }]),
    ...(has(r, c - 1) ? [] : [{ x1: c, y1: r, x2: c, y2: r + 1 }]),
    ...(has(r, c + 1) ? [] : [{ x1: c + 1, y1: r, x2: c + 1, y2: r + 1 }]),
  ])
}

/**
 * A clue whose rules each pick cells ("sur une chaise, dans le coin d'une
 * zone") shows the cells that pass them all, not each rule's cells.
 */
const clueMarks = (rules: PersonRule[], board: Board, key: string): Marked[] => {
  const tests = rules.map((rule) => cellTest(rule, board))
  if (tests.filter(Boolean).length < 2) return rules.flatMap((rule) => personMarks(rule, board))
  const cells = cellsWhere(board, (row, col) => tests.every((test) => !test || test(row, col)))
  return [
    [{ key, shape: 'fill', cells }, 'forced'],
    ...rules.filter((_, i) => !tests[i]).flatMap((rule) => personMarks(rule, board)),
  ]
}

/** A suspect's card, or a line of the general clues (by index). */
export type PointedClue = { person: string } | { general: number }

/** What a pointed clue shows: places on the map, and the people it measures against. */
export interface ClueHints {
  highlights: Highlight[]
  /** Above them, columns apart, in the same room, closer than them: in blue, card and cell. */
  people: string[]
}

const peopleOf = (rule: PersonRule): string[] => {
  if (rule.type === 'anyOf') return rule.rules.flatMap(peopleOf)
  return 'person' in rule ? [rule.person] : []
}

/** The rules about people of a clue ("the boss..." among the general ones). */
const personRulesOf = (rules: GlobalRule[]) =>
  rules.flatMap((rule) => (rule.type === 'person' ? [rule.rule] : []))

export const clueHints = (clue: PointedClue, puzzle: Puzzle, placements: Placements): ClueHints => {
  const general = 'general' in clue ? (puzzle.general[clue.general]?.rules ?? []) : []
  const clues = 'person' in clue ? (puzzle.clues[clue.person] ?? []) : []
  const own = clues.flatMap((c) => c.rules)
  const marked =
    'person' in clue
      ? clues.flatMap((c, i) => clueMarks(c.rules, puzzle.board, `clue:${i}`))
      : general.flatMap((rule) => globalMarks(rule, puzzle.board))
  const people = [...new Set([...own, ...personRulesOf(general)].flatMap(peopleOf))]
  const placed = people.flatMap((id): Marked[] => {
    const cell = placements[id]
    return cell ? [[{ key: `person:${id}`, shape: 'fill', cells: [cell] }, 'landmark']] : []
  })
  return { highlights: merge([...marked, ...placed]), people }
}
