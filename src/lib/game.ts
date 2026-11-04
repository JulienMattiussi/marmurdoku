import { cellName, parseCellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import type { Placements } from '@/lib/rules'
import { brokenClues, type ClueRef, type Puzzle } from '@/lib/solver'

/**
 * What the player has done so far, everything the undo history keeps: who
 * stands where, crossed-out cells, and the positions noted for each suspect.
 * Who is picked in the cast is not part of it: undo never changes the pick.
 */
export interface GameState {
  placements: Placements
  /** Cells ruled out, by map coordinate ("B3"): by the player, or by a placement. */
  crosses: string[]
  /**
   * The crosses a placement put on its row and column, among `crosses`: they
   * go when nobody stands on their line any more. A cross the player puts
   * (or puts back) is theirs, and stays.
   */
  autoCrosses: string[]
  /** Positions the player noted as possible, per suspect, by map coordinate. */
  notes: Record<string, string[]>
}

/** What the cross card carries when dragged, in place of a suspect's id. */
export const CROSS = 'cross'

/** Placing on a cell, or noting it for the picked suspect. */
export type Mode = 'place' | 'note'

export const emptyGame = (): GameState => ({
  placements: {},
  crosses: [],
  autoCrosses: [],
  notes: {},
})

const personAt = (state: GameState, cell: Cell) =>
  Object.keys(state.placements).find((id) => cellName(state.placements[id]!) === cellName(cell))

const sameLine = (a: Cell, b: Cell) => a.row === b.row || a.col === b.col

/** Without these crosses, automatic or not. */
const uncross = (state: GameState, names: string[]): GameState => ({
  ...state,
  crosses: state.crosses.filter((name) => !names.includes(name)),
  autoCrosses: state.autoCrosses.filter((name) => !names.includes(name)),
})

/** New placements: the automatic crosses left on nobody's line go. */
const withPlacements = (state: GameState, placements: Placements): GameState => {
  const placed = Object.values(placements)
  const stale = state.autoCrosses.filter(
    (name) => !placed.some((cell) => sameLine(cell, parseCellName(name))),
  )
  return uncross({ ...state, placements }, stale)
}

/**
 * Puts a person on a cell, moving them if already placed and freeing the cell
 * first. Nobody else can stand on that row and column any more: the other
 * suspects' notes there go, and its free `placeable` cells get crossed out,
 * automatic crosses the player can clear like any other, and that go when
 * the person leaves the line. All of it is one move for undo.
 */
const put = (state: GameState, person: string, cell: Cell, placeable: boolean[][]): GameState => {
  const placements = { ...state.placements }
  const occupant = personAt(state, cell)
  if (occupant) delete placements[occupant]
  placements[person] = cell
  const moved = withPlacements(state, placements)
  const notes = Object.fromEntries(
    Object.entries(state.notes).map(([id, names]) => [
      id,
      id === person ? names : names.filter((name) => !sameLine(cell, parseCellName(name))),
    ]),
  )
  const lineCells = placeable.flatMap((cells, row) =>
    cells.flatMap((free, col) =>
      free && (row === cell.row) !== (col === cell.col) ? [{ row, col }] : [],
    ),
  )
  const added = lineCells
    .filter((other) => !Object.values(placements).some((p) => cellName(p) === cellName(other)))
    .map(cellName)
    .filter((name) => !moved.crosses.includes(name))
  return uncross(
    {
      placements,
      crosses: [...moved.crosses, ...added],
      autoCrosses: [...moved.autoCrosses, ...added],
      notes,
    },
    [cellName(cell)],
  )
}

/**
 * Crosses a cell out over whoever stood there; a cross rules the cell out for
 * everyone, so its notes go too.
 */
const crossOut = (state: GameState, cell: Cell): GameState => {
  const name = cellName(cell)
  const placements = { ...state.placements }
  const occupant = personAt(state, cell)
  if (occupant) delete placements[occupant]
  // The player's own cross now, even over an automatic one.
  const cleared = uncross(withPlacements(state, placements), [name])
  return {
    ...cleared,
    crosses: [...cleared.crosses, name],
    notes: Object.fromEntries(
      Object.entries(state.notes).map(([id, names]) => [id, names.filter((n) => n !== name)]),
    ),
  }
}

const toggleNote = (state: GameState, person: string, cell: Cell): GameState => {
  const name = cellName(cell)
  const current = state.notes[person] ?? []
  const notes = {
    ...state.notes,
    [person]: current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
  }
  return { ...state, notes }
}

/**
 * Clicking a cell. With a suspect picked in "note" mode, notes or unnotes the
 * cell for them. With a suspect picked otherwise: takes them off if they stand
 * there, else places them, over whatever was there. With nobody picked: clears
 * the cross, or crosses the cell out over whoever stood there, which also
 * clears every note on it.
 */
export const clickCell = (
  state: GameState,
  cell: Cell,
  selected: string | null,
  mode: Mode = 'place',
  /** Placeable cells, crossed out on a placement's row and column (none without). */
  placeable: boolean[][] = [],
): GameState => {
  if (mode === 'note' && selected) return toggleNote(state, selected, cell)
  const name = cellName(cell)
  if (selected) {
    if (personAt(state, cell) !== selected) return put(state, selected, cell, placeable)
    const placements = { ...state.placements }
    delete placements[selected]
    return withPlacements(state, placements)
  }
  if (state.crosses.includes(name)) return uncross(state, [name])
  return crossOut(state, cell)
}

/** Dropping a dragged person, or the cross, on a cell replaces whatever was there. */
export const dropOn = (
  state: GameState,
  dragged: string,
  cell: Cell,
  placeable: boolean[][] = [],
): GameState => (dragged === CROSS ? crossOut(state, cell) : put(state, dragged, cell, placeable))

/** The board rules a check names when broken, before the clues. */
const ONE_PER_LINE = 'Exactement une personne par ligne et par colonne'
const STANDING = 'Chacun se tient sur le sol ou sur un meuble où il peut s’asseoir ou s’allonger'

/**
 * What the "Vérifier" button finds wrong in a complete placement: the board
 * rules (one per row and column, on placeable cells), then every clue the
 * murder included. Judged on the rules rather than against data/solution.ts,
 * so that any placement the clues allow wins.
 */
export const brokenRules = (puzzle: Puzzle, placements: Placements): ClueRef[] => {
  const placed = puzzle.people.flatMap((id) => placements[id] ?? [])
  const distinct = (values: number[]) => new Set(values).size === values.length
  const board = [
    {
      text: ONE_PER_LINE,
      holds: distinct(placed.map((cell) => cell.row)) && distinct(placed.map((cell) => cell.col)),
    },
    { text: STANDING, holds: placed.every(({ row, col }) => puzzle.board.placeable[row]![col]) },
  ]
  return [
    ...board.filter(({ holds }) => !holds).map(({ text }) => ({ text })),
    ...brokenClues(puzzle, placements),
  ]
}

/** What a click on a cell does: place or note for the picked suspect, cross out with nobody picked. */
export type Tool = Mode | 'cross'

/** What a click on a cell will do, for the cursor over the map and the toolbar. */
export const clickEffect = (selected: string | null, mode: Mode): Tool =>
  selected ? mode : 'cross'
