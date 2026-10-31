import { columnName } from '@/lib/geometry'

describe('columnName', () => {
  it('names the 20 columns from A to T', () => {
    expect(columnName(0)).toBe('A')
    expect(columnName(19)).toBe('T')
  })
})
