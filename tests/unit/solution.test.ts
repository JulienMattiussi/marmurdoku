import { MURDERER, PEOPLE, VICTIM } from '@/data/people'
import { SOLUTION } from '@/data/solution'
import { brokenRules } from '@/lib/game'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

describe('the solution', () => {
  it('places every person of the cast', () => {
    expect(Object.keys(SOLUTION).sort()).toEqual(PEOPLE.map((p) => p.id).sort())
  })

  it('breaks no rule', () => {
    expect(brokenRules(PUZZLE, SOLUTION_PLACEMENTS)).toEqual([])
  })

  // The story, which the rules never know: the culprit alone with the victim in their room.
  it('leaves the culprit alone with the victim', () => {
    const zoneOf = (id: string) => {
      const { row, col } = SOLUTION_PLACEMENTS[id]!
      return PUZZLE.board.zones[row]![col]
    }
    const there = Object.keys(SOLUTION_PLACEMENTS).filter((id) => zoneOf(id) === zoneOf(VICTIM))
    expect(there.sort()).toEqual([MURDERER, VICTIM].sort())
  })
})
