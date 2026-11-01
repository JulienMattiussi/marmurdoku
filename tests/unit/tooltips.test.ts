import { FURNITURE, ZONE_GRID } from '@/data/office'
import { ZONES } from '@/data/zones'
import { parseCellName } from '@/lib/geometry'
import { parseZoneGrid } from '@/lib/grid'
import { groundLabels, tooltips } from '@/lib/tooltips'

const ground = groundLabels(parseZoneGrid(ZONE_GRID, ZONES), FURNITURE)
const at = (labels: string[][] | string[][][], name: string) => {
  const { row, col } = parseCellName(name)
  return labels[row]![col]
}

describe('tooltips', () => {
  it('names the furniture, then the carpet', () => {
    expect(at(ground, 'K9')).toEqual(['Chaise'])
    expect(at(ground, 'M1')).toEqual(['Chaise', 'Moquette'])
    expect(at(ground, 'C2')).toEqual(['Moquette'])
  })

  it('puts who stands there first, and says nothing of an empty bare cell', () => {
    const labels = tooltips(ground, { karen: parseCellName('M1') }, () => 'Karen')
    expect(at(labels, 'M1')).toBe('Karen · Chaise · Moquette')
    expect(at(labels, 'S8')).toBe('')
  })
})
