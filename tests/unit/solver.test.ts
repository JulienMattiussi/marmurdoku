import { buildBoard } from '@/lib/board'
import { puzzleStatus, solve, type Puzzle } from '@/lib/solver'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

describe('the clues of the level', () => {
  it('all hold on the solution', () => {
    expect(puzzleStatus(PUZZLE, SOLUTION_PLACEMENTS)).toBe('ok')
  })

  it('lead to that solution and no other', () => {
    expect(solve(PUZZLE, 2)).toEqual([SOLUTION_PLACEMENTS])
  })
})

describe('solve', () => {
  const tiny = (clues: Puzzle['clues']): Puzzle => ({
    board: buildBoard(
      ['AB', 'AB'],
      [
        { code: 'A', id: 'a', name: 'A', floor: 'oak', level: 'ground' },
        { code: 'B', id: 'b', name: 'B', floor: 'oak', level: 'ground' },
      ],
      [],
    ),
    people: ['victim', 'murderer'],
    clues,
    general: [],
  })

  it('finds no solution when no zone can hold exactly two people', () => {
    expect(solve(tiny({}))).toEqual([])
  })

  it('tells a unique solution from several', () => {
    const board = buildBoard(
      ['AA', 'AA'],
      [{ code: 'A', id: 'a', name: 'A', floor: 'oak', level: 'ground' }],
      [],
    )
    const open: Puzzle = { ...tiny({}), board }
    expect(solve(open)).toHaveLength(2)
    const corner: Puzzle = {
      ...open,
      clues: {
        victim: [
          {
            text: 'en A1',
            rules: [
              { type: 'inRows', rows: [0] },
              { type: 'inColumns', cols: [0] },
            ],
          },
        ],
      },
    }
    expect(solve(corner)).toEqual([{ victim: { row: 0, col: 0 }, murderer: { row: 1, col: 1 } }])
  })
})
