import { cellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import { personRuleStatus, type Placements } from '@/lib/rules'
import { ownCells, puzzleStatus, type Puzzle } from '@/lib/solver'

/**
 * A simulated player, to measure how hard the puzzle is. For now it only
 * reads, the way a person would without trying anything:
 * - a suspect with a single cell left, or a row or column that only one
 *   suspect can still take, is placed;
 * - a cell is ruled out when, with the suspects already placed, it would
 *   break a clue, or leave a related suspect (same zone, column gap…) with no
 *   cell at all.
 * Where reading gets stuck is where the player has to start trying.
 */

export interface Report {
  /** Placements in the order a reader finds them, with the reason. */
  steps: string[]
  /** Cells still open for each suspect not placed, when reading gets stuck. */
  open: Map<string, Cell[]>
  /** False if reading itself hits a contradiction (the clues are wrong). */
  consistent: boolean
}

interface State {
  candidates: Map<string, Cell[]>
  placed: Placements
}

/** Two-person rules: who states them, about whom. */
const linksOf = (puzzle: Puzzle) =>
  Object.entries(puzzle.clues).flatMap(([owner, clues]) =>
    clues
      .flatMap((clue) => clue.rules)
      .flatMap((rule) => ('person' in rule ? [{ owner, other: rule.person, rule }] : [])),
  )

/**
 * Reads until nothing more can be deduced. Returns false on a contradiction,
 * and logs each placement in `log` (a reason and a cell).
 */
const read = (puzzle: Puzzle, state: State, log: string[]): boolean => {
  const { people, board } = puzzle
  const links = linksOf(puzzle)
  for (;;) {
    let changed = false
    const placedCells = Object.values(state.placed)
    for (const person of people) {
      if (state.placed[person]) continue
      const kept = state.candidates.get(person)!.filter((cell) => {
        if (placedCells.some((c) => c.row === cell.row || c.col === cell.col)) return false
        if (puzzleStatus(puzzle, { ...state.placed, [person]: cell }) === 'broken') return false
        // A related suspect, not placed yet, must keep a cell that fits.
        for (const { owner, other, rule } of links) {
          if (owner !== person && other !== person) continue
          const partner = owner === person ? other : owner
          if (state.placed[partner]) continue
          const fits = state.candidates.get(partner)!.some((spot) => {
            if (spot.row === cell.row || spot.col === cell.col) return false
            const pair = { [person]: cell, [partner]: spot }
            return personRuleStatus(rule, owner, pair, board, people) !== 'broken'
          })
          if (!fits) return false
        }
        return true
      })
      if (!kept.length) return false
      if (kept.length !== state.candidates.get(person)!.length) changed = true
      state.candidates.set(person, kept)
    }

    const place = (person: string, cell: Cell, reason: string) => {
      state.placed[person] = cell
      state.candidates.set(person, [cell])
      log.push(`${person} en ${cellName(cell)} (${reason})`)
      changed = true
    }
    const left = people.filter((p) => !state.placed[p])
    for (const person of left) {
      const cells = state.candidates.get(person)!
      if (cells.length === 1) {
        place(person, cells[0]!, 'seule case possible')
        break
      }
    }
    if (!changed) {
      for (let line = 0; line < board.size && !changed; line++) {
        for (const axis of ['row', 'col'] as const) {
          if (Object.values(state.placed).some((c) => c[axis] === line)) continue
          const takers = left.filter((p) => state.candidates.get(p)!.some((c) => c[axis] === line))
          if (!takers.length) return false
          if (takers.length === 1) {
            const person = takers[0]!
            const cells = state.candidates.get(person)!.filter((c) => c[axis] === line)
            const name =
              axis === 'row' ? `ligne ${line + 1}` : `colonne ${String.fromCharCode(65 + line)}`
            if (cells.length === 1) place(person, cells[0]!, `seul possible en ${name}`)
            else {
              state.candidates.set(person, cells)
              changed = true
            }
            break
          }
        }
      }
    }
    if (!changed) return true
  }
}

/** Reads the puzzle as a person would, until stuck. */
export const analyze = (puzzle: Puzzle): Report => {
  const state: State = { candidates: ownCells(puzzle), placed: {} }
  const steps: string[] = []
  const consistent = read(puzzle, state, steps)
  const open = new Map([...state.candidates].filter(([person]) => !state.placed[person]))
  return { steps, open, consistent }
}

export interface Round {
  /** Who gets placed at this round (the most constrained), and where. */
  person: string
  cell: Cell
  /** Open cells of every suspect still to place, before this placement. */
  counts: number[]
}

/**
 * Plays the solution in the order a player would find it easiest: each round
 * places the suspect with the fewest open cells, on their right cell, and
 * records how many cells everyone still to place had open just before. The
 * counts tell how open the puzzle stays as the player goes.
 */
export const rounds = (puzzle: Puzzle, solution: Placements): Round[] => {
  const own = ownCells(puzzle)
  const placed: Placements = {}
  const result: Round[] = []
  for (;;) {
    const left = puzzle.people.filter((p) => !placed[p])
    if (!left.length) return result
    const taken = Object.values(placed)
    const open = new Map(
      left.map((person) => [
        person,
        own
          .get(person)!
          .filter(
            (cell) =>
              !taken.some((c) => c.row === cell.row || c.col === cell.col) &&
              puzzleStatus(puzzle, { ...placed, [person]: cell }) !== 'broken',
          ),
      ]),
    )
    const person = [...left].sort((a, b) => open.get(a)!.length - open.get(b)!.length)[0]!
    result.push({ person, cell: solution[person]!, counts: left.map((p) => open.get(p)!.length) })
    placed[person] = solution[person]!
  }
}
