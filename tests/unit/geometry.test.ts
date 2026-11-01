import { cellName, columnName, parseCellName } from '@/lib/geometry'

describe('columnName', () => {
  it('names the 20 columns from A to T', () => {
    expect(columnName(0)).toBe('A')
    expect(columnName(19)).toBe('T')
  })
})

describe('parseCellName', () => {
  it('reads the column letter and the row number, back from cellName', () => {
    expect(parseCellName('B3')).toEqual({ row: 2, col: 1 })
    expect(parseCellName('T20')).toEqual({ row: 19, col: 19 })
    expect(cellName(parseCellName('K9'))).toBe('K9')
  })
})
