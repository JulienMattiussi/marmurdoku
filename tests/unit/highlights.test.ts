import { clueHints, outline, type PointedClue } from '@/lib/highlights'
import type { Placements } from '@/lib/rules'
import { PUZZLE } from '@/puzzle'

const highlightsOf = (clue: PointedClue, placements: Placements = {}) =>
  clueHints(clue, PUZZLE, placements).highlights
const marks = (highlights: ReturnType<typeof highlightsOf>) =>
  Object.fromEntries(highlights.map((h) => [h.key, h.mark]))

describe('clueHints', () => {
  it('frames the room a suspect must be in, and shows the furniture they must be next to as a landmark', () => {
    expect(marks(highlightsOf({ person: 'benoit' }))).toEqual({
      'zone:bathroom': 'forced',
      'kind:toilet': 'landmark',
    })
  })

  it('frames the rooms a suspect must stay out of in red', () => {
    expect(marks(highlightsOf({ person: 'julio' }))).toEqual({
      'zone:commons': 'forbidden',
      'zone:yard': 'forbidden',
    })
  })

  it('shows a chair to stand next to, but not on, as a landmark', () => {
    const jibe = marks(highlightsOf({ person: 'jibe' }))
    expect(jibe['kind:chair']).toBe('landmark')
    expect(jibe['kind:bed']).toBe('forbidden')
  })

  it('shows the furniture of a distance as a landmark, and frames a forced row', () => {
    expect(marks(highlightsOf({ person: 'karen' }))).toEqual({
      'kind:mailbox': 'landmark',
    })
    expect(marks(highlightsOf({ person: 'sohanne' }))).toEqual({ 'row:15': 'forced' })
  })

  it('fills only the chairs in a corner for a clue telling both', () => {
    const corners = highlightsOf({ person: 'caroline' })
    expect(corners).toHaveLength(1)
    expect(corners[0]!.mark).toBe('forced')
    expect(corners[0]!.cells.length).toBeGreaterThan(0)
    // Every cell both a chair and a corner: the whole clue, not each part.
    for (const { row, col } of corners[0]!.cells) {
      expect(PUZZLE.board.kinds[row]![col]).toContain('chair')
      expect(PUZZLE.board.zones[row]![col]).not.toBeNull()
    }
  })

  it('names the people a clue measures against, and fills their cell once placed', () => {
    expect(clueHints({ person: 'anthony' }, PUZZLE, {}).people).toEqual(['thibault'])
    expect(highlightsOf({ person: 'anthony' })).toEqual([])
    expect(marks(highlightsOf({ person: 'anthony' }, { thibault: { row: 5, col: 2 } }))).toEqual({
      'person:thibault': 'landmark',
    })
  })

  it('names nobody for a clue about the room', () => {
    expect(clueHints({ person: 'guiom' }, PUZZLE, {})).toEqual({ highlights: [], people: [] })
  })

  it('highlights a general clue', () => {
    const lines = PUZZLE.general.map((_, index) => marks(highlightsOf({ general: index })))
    expect(lines).toContainEqual({ 'kind:foosball': 'landmark' })
    expect(lines).toContainEqual({ 'zone:large-open-space': 'forced' })
  })
})

describe('outline', () => {
  it('goes around a set of cells, not between them', () => {
    expect(
      outline([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ]),
    ).toHaveLength(6)
  })
})
