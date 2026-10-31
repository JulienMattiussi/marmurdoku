import { FURNITURE, ZONE_GRID } from '@/data/office'
import { MURDERER, PEOPLE, VICTIM } from '@/data/people'
import { SOLUTION } from '@/data/solution'
import { ZONES } from '@/data/zones'
import { placeableGrid } from '@/lib/furniture'
import { parseZoneGrid } from '@/lib/grid'
import { parseCellName, solutionProblems } from '@/lib/solution'

const zones = parseZoneGrid(ZONE_GRID, ZONES)
const placeable = placeableGrid(zones, FURNITURE)
const placements = Object.fromEntries(
  Object.entries(SOLUTION).map(([id, name]) => [id, parseCellName(name)]),
)

describe('parseCellName', () => {
  it('reads the column letter and the row number', () => {
    expect(parseCellName('B3')).toEqual({ row: 2, col: 1 })
    expect(parseCellName('T20')).toEqual({ row: 19, col: 19 })
  })
})

describe('the solution', () => {
  it('places every person of the cast', () => {
    expect(Object.keys(SOLUTION).sort()).toEqual(PEOPLE.map((p) => p.id).sort())
  })

  it('breaks no rule', () => {
    expect(solutionProblems(placements, zones, placeable, VICTIM, MURDERER)).toEqual([])
  })
})

describe('solutionProblems', () => {
  it('reports a shared column and an empty one', () => {
    const tiny = parseZoneGrid(
      ['AA', 'AA'],
      [{ code: 'A', id: 'a', name: 'A', floor: 'oak', level: 'ground' }],
    )
    const problems = solutionProblems(
      { v: { row: 0, col: 0 }, m: { row: 1, col: 0 } },
      tiny,
      [
        [true, true],
        [true, true],
      ],
      'v',
      'm',
    )
    expect(problems).toContain('2 personne(s) sur la colonne 1')
    expect(problems).toContain('0 personne(s) sur la colonne 2')
  })
})
