import { CLUES, GENERAL_CLUES } from '@/data/clues'
import { FURNITURE, ZONE_GRID } from '@/data/office'
import { PEOPLE } from '@/data/people'
import { SOLUTION } from '@/data/solution'
import { ZONES } from '@/data/zones'
import { buildBoard } from '@/lib/board'
import { parseCellName } from '@/lib/geometry'
import type { Puzzle } from '@/lib/solver'

/**
 * The level, assembled from src/data/ for the game, the solver and the tests.
 * Who the victim and the culprit are stays out of it: the player does not know.
 */
export const PUZZLE: Puzzle = {
  board: buildBoard(ZONE_GRID, ZONES, FURNITURE),
  people: PEOPLE.map((person) => person.id),
  clues: CLUES,
  general: GENERAL_CLUES,
}

export const SOLUTION_PLACEMENTS = Object.fromEntries(
  Object.entries(SOLUTION).map(([id, name]) => [id, parseCellName(name)]),
)
