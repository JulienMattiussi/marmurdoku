import { CROSS, brokenRules, clickCell, clickEffect, dropOn, emptyGame } from '@/lib/game'
import { record, redo, startHistory, undo } from '@/lib/history'
import { addSave, defaultName, parseSaves, removeSave } from '@/lib/saves'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

const A1 = { row: 0, col: 0 }
const B2 = { row: 1, col: 1 }

describe('clickCell', () => {
  it('crosses out an empty cell when nobody is picked, and clears the cross', () => {
    const crossed = clickCell(emptyGame(), A1, null)
    expect(crossed.crosses).toEqual(['A1'])
    expect(clickCell(crossed, A1, null).crosses).toEqual([])
  })

  it('places the picked person, moving them if already placed', () => {
    let state = clickCell(emptyGame(), A1, 'karen')
    expect(state.placements).toEqual({ karen: A1 })
    state = clickCell(state, B2, 'karen')
    expect(state.placements).toEqual({ karen: B2 })
  })

  it('places the picked person over a cross', () => {
    const state = clickCell(clickCell(emptyGame(), A1, null), A1, 'karen')
    expect(state.placements).toEqual({ karen: A1 })
    expect(state.crosses).toEqual([])
  })

  it('takes the picked person off their own cell, and replaces anyone else', () => {
    const state = clickCell(emptyGame(), A1, 'karen')
    expect(clickCell(state, A1, 'karen').placements).toEqual({})
    expect(clickCell(state, A1, 'julio').placements).toEqual({ julio: A1 })
  })

  it('crosses out a cell over the person standing there when nobody is picked', () => {
    const state = clickCell(clickCell(emptyGame(), A1, 'karen'), A1, null)
    expect(state.placements).toEqual({})
    expect(state.crosses).toEqual(['A1'])
  })

  it('notes and unnotes a cell for the picked suspect in note mode', () => {
    const noted = clickCell(emptyGame(), A1, 'karen', 'note')
    expect(noted.notes).toEqual({ karen: ['A1'] })
    expect(noted.placements).toEqual({})
    expect(clickCell(noted, A1, 'karen', 'note').notes).toEqual({ karen: [] })
  })
})

describe('placing', () => {
  it('clears the other suspects’ notes on the same row and column, in one move', () => {
    let state = emptyGame()
    for (const cell of [
      { row: 0, col: 3 },
      { row: 4, col: 1 },
      { row: 4, col: 4 },
    ]) {
      state = clickCell(state, cell, 'julio', 'note')
    }
    state = clickCell(state, A1, 'karen', 'note')
    state = clickCell(state, B2, 'karen')
    expect(state.notes.julio).toEqual(['D1', 'E5'])
    expect(state.notes.karen).toEqual(['A1'])
  })
})

describe('dropOn', () => {
  it('replaces a person or a cross already on the cell', () => {
    let state = dropOn(emptyGame(), 'karen', A1)
    state = dropOn(state, 'julio', A1)
    expect(state.placements).toEqual({ julio: A1 })
    state = dropOn(clickCell(state, B2, null), 'karen', B2)
    expect(state.crosses).toEqual([])
    expect(state.placements).toEqual({ julio: A1, karen: B2 })
  })

  it('drops the cross over a person, clearing the cell’s notes', () => {
    let state = clickCell(dropOn(emptyGame(), 'karen', A1), B2, 'julio', 'note')
    state = dropOn(dropOn(state, CROSS, A1), CROSS, B2)
    expect(state.placements).toEqual({})
    expect(state.crosses).toEqual(['A1', 'B2'])
    expect(state.notes).toEqual({ julio: [] })
  })
})

describe('history', () => {
  it('undoes and redoes moves, and records nothing for a move that changes nothing', () => {
    let history = startHistory(emptyGame())
    history = record(history, clickCell(history.present, A1, null))
    history = record(history, clickCell(history.present, B2, 'karen'))
    history = record(history, history.present)
    expect(history.past).toHaveLength(2)
    history = undo(history)
    expect(history.present.placements).toEqual({})
    expect(history.present.crosses).toEqual(['A1'])
    history = redo(history)
    expect(history.present.placements).toEqual({ karen: B2 })
    history = record(undo(history), emptyGame())
    expect(history.future).toEqual([])
  })
})

describe('brokenRules', () => {
  it('finds nothing in the solution, and names each broken clue with its card', () => {
    expect(brokenRules(PUZZLE, SOLUTION_PLACEMENTS)).toEqual([])
    const swapped = {
      ...SOLUTION_PLACEMENTS,
      francois: SOLUTION_PLACEMENTS.antoine!,
      antoine: SOLUTION_PLACEMENTS.francois!,
    }
    expect(brokenRules(PUZZLE, swapped)).toContainEqual({
      person: 'antoine',
      text: 'était dans le lit',
    })
  })

  it('names only the broken part of a clue told in parts', () => {
    // Matthieu from F17 to D17: still in the break room, no longer 3 columns from Julio (I).
    const moved = { ...SOLUTION_PLACEMENTS, matthieu: { ...SOLUTION_PLACEMENTS.matthieu!, col: 3 } }
    const matthieu = brokenRules(PUZZLE, moved).filter(({ person }) => person === 'matthieu')
    expect(matthieu).toEqual([
      { person: 'matthieu', text: 'était à exactement 3 colonnes de Julio' },
    ])
  })

  it('names the one-per-line rule first', () => {
    // Karen from S8 to S6, on Maxime's row.
    const sameRow = { ...SOLUTION_PLACEMENTS, karen: { ...SOLUTION_PLACEMENTS.karen!, row: 5 } }
    expect(brokenRules(PUZZLE, sameRow)[0]).toEqual({
      text: 'Exactement une personne par ligne et par colonne',
    })
  })
})

describe('saves', () => {
  it('adds named saves first, removes them, and drops unreadable storage', () => {
    let saves = addSave([], 'Avant Karen', emptyGame(), 1)
    saves = addSave(saves, '  ', clickCell(emptyGame(), A1, null), 2)
    expect(saves.map((s) => s.name)).toEqual([defaultName(2), 'Avant Karen'])
    expect(parseSaves(JSON.stringify(saves))).toEqual(saves)
    expect(removeSave(saves, saves[0]!.id)).toHaveLength(1)
    expect(parseSaves('pas du json')).toEqual([])
    expect(parseSaves('[{"id":1}]')).toEqual([])
  })
})

describe('crossing out', () => {
  it('clears every note on the cell, in the same move', () => {
    let state = clickCell(emptyGame(), A1, 'karen', 'note')
    state = clickCell(state, A1, 'julio', 'note')
    state = clickCell(state, B2, 'julio', 'note')
    state = clickCell(state, A1, null)
    expect(state.crosses).toEqual(['A1'])
    expect(state.notes).toEqual({ karen: [], julio: ['B2'] })
  })

  it('is what a click does with nobody picked, whatever the mode', () => {
    expect(clickEffect(null, 'note')).toBe('cross')
    expect(clickEffect('karen', 'note')).toBe('note')
    expect(clickEffect('karen', 'place')).toBe('place')
  })
})
