import { clickCell, dropPerson, emptyGame, isSolved, toggleSelection } from '@/lib/game'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

const A1 = { row: 0, col: 0 }
const B2 = { row: 1, col: 1 }

describe('toggleSelection', () => {
  it('picks one person at a time, and drops the pick on a second click', () => {
    let state = toggleSelection(emptyGame(), 'karen')
    expect(state.selected).toBe('karen')
    state = toggleSelection(state, 'julio')
    expect(state.selected).toBe('julio')
    expect(toggleSelection(state, 'julio').selected).toBeNull()
  })
})

describe('clickCell', () => {
  it('crosses out an empty cell when nobody is picked, and clears the cross', () => {
    const crossed = clickCell(emptyGame(), A1)
    expect(crossed.crosses).toEqual(['A1'])
    expect(clickCell(crossed, A1).crosses).toEqual([])
  })

  it('places the picked person, moving them if already placed', () => {
    let state = clickCell(toggleSelection(emptyGame(), 'karen'), A1)
    expect(state.placements).toEqual({ karen: A1 })
    expect(state.selected).toBeNull()
    state = clickCell(toggleSelection(state, 'karen'), B2)
    expect(state.placements).toEqual({ karen: B2 })
  })

  it('empties a cell taken by a person', () => {
    const state = clickCell(toggleSelection(emptyGame(), 'karen'), A1)
    expect(clickCell(state, A1).placements).toEqual({})
  })
})

describe('dropPerson', () => {
  it('replaces a person or a cross already on the cell', () => {
    let state = dropPerson(emptyGame(), 'karen', A1)
    state = dropPerson(state, 'julio', A1)
    expect(state.placements).toEqual({ julio: A1 })
    state = dropPerson(clickCell(state, B2), 'karen', B2)
    expect(state.crosses).toEqual([])
    expect(state.placements).toEqual({ julio: A1, karen: B2 })
  })
})

describe('isSolved', () => {
  it('accepts the solution, refuses it incomplete or with a broken clue', () => {
    expect(isSolved(PUZZLE, SOLUTION_PLACEMENTS)).toBe(true)
    const missing = { ...SOLUTION_PLACEMENTS }
    delete missing.karen
    expect(isSolved(PUZZLE, missing)).toBe(false)
    const swapped = {
      ...SOLUTION_PLACEMENTS,
      francois: SOLUTION_PLACEMENTS.antoine!,
      antoine: SOLUTION_PLACEMENTS.francois!,
    }
    expect(isSolved(PUZZLE, swapped)).toBe(false)
  })
})
