import { buildBoard, distanceTo, isAwayFromWalls, isInCorner, isNear } from '@/lib/board'
import { FURNITURE, ZONE_GRID } from '@/data/office'
import { ZONES } from '@/data/zones'
import {
  furnitureCells,
  occupancyGrid,
  seatedCells,
  spriteSides,
  FURNITURE_KINDS,
} from '@/lib/furniture'
import { parseZoneGrid } from '@/lib/grid'

const zones = parseZoneGrid(ZONE_GRID, ZONES)
const size = ZONE_GRID.length

describe('office layout', () => {
  it('is a 20x20 grid using every zone', () => {
    expect(size).toBe(20)
    const used = new Set(zones.flat().map((zone) => zone?.id))
    for (const zone of ZONES) expect(used).toContain(zone.id)
  })

  it('keeps every room in one piece', () => {
    for (const zone of ZONES) {
      const cells = zones.flatMap((row, r) =>
        row.flatMap((z, c) => (z === zone ? [`${r},${c}`] : [])),
      )
      const seen = new Set([cells[0]])
      const queue = [cells[0]!]
      while (queue.length) {
        const [r, c] = queue.pop()!.split(',').map(Number) as [number, number]
        for (const next of [`${r - 1},${c}`, `${r + 1},${c}`, `${r},${c - 1}`, `${r},${c + 1}`]) {
          if (cells.includes(next) && !seen.has(next)) {
            seen.add(next)
            queue.push(next)
          }
        }
      }
      expect(seen.size, zone.name).toBe(cells.length)
    }
  })

  it('places furniture inside rooms without overlaps, except on rugs', () => {
    const taken = new Map<string, string>()
    for (const piece of FURNITURE) {
      for (const { row, col } of furnitureCells(piece)) {
        expect(zones[row]?.[col], `${piece.kind} at ${row},${col}`).toBeTruthy()
        if (piece.kind === 'rug') continue
        const key = `${row},${col}`
        expect(taken.get(key), `${piece.kind} at ${key}`).toBeUndefined()
        taken.set(key, piece.kind)
      }
    }
  })

  it('leaves at least one free cell in every row and column', () => {
    const free = occupancyGrid(
      zones.map((row) => row.map(Boolean)),
      FURNITURE,
    )
    for (let i = 0; i < size; i++) {
      expect(free[i]!.some(Boolean), `row ${i}`).toBe(true)
      expect(
        free.some((row) => row[i]),
        `column ${i}`,
      ).toBe(true)
    }
  })
})

describe('occupancyGrid', () => {
  it('blocks the cells under a blocking piece, even on a rug', () => {
    const free = occupancyGrid(
      [[true, true, true]],
      [
        { kind: 'rug', row: 0, col: 0, width: 3 },
        { kind: 'foosball', row: 0, col: 1 },
      ],
    )
    expect(free).toEqual([[true, false, true]])
    expect(FURNITURE_KINDS.rug.occupiable).toBe(true)
  })
})

describe('spriteSides', () => {
  it('turns map sides into the frame of a sprite drawn facing south', () => {
    expect(spriteSides(['west'], 'west')).toEqual(['south'])
    expect(spriteSides(['north'], 'south')).toEqual(['north'])
    expect(spriteSides(['east', 'south'])).toEqual(['east', 'south'])
    expect(spriteSides(['north'], 'east')).toEqual(['east'])
  })
})

describe('seatedCells', () => {
  it('only counts desk cells with a seat on their user side', () => {
    const island = { kind: 'desk' as const, row: 1, col: 0, width: 2, height: 2 }
    const furniture = [
      island,
      { kind: 'chair' as const, row: 0, col: 0 },
      { kind: 'chair' as const, row: 3, col: 1 },
      { kind: 'plant' as const, row: 0, col: 1 },
    ]
    expect(seatedCells(island, furniture)).toEqual([true, false, false, true])
  })

  it('looks on the facing side of a lone desk', () => {
    const desk = { kind: 'desk' as const, row: 0, col: 1, facing: 'west' as const }
    expect(seatedCells(desk, [desk, { kind: 'chair', row: 0, col: 0 }])).toEqual([true])
  })
})

describe('isNear', () => {
  it('sees a piece in the next cell of the same room, not through a wall', () => {
    const board = buildBoard(
      ['AB', 'AB'],
      [
        { code: 'A', id: 'a', name: 'A', floor: 'oak', level: 'ground' },
        { code: 'B', id: 'b', name: 'B', floor: 'oak', level: 'ground' },
      ],
      [{ kind: 'plant', row: 0, col: 1 }],
    )
    expect(isNear(board, { row: 1, col: 1 }, ['plant'])).toBe(true)
    expect(isNear(board, { row: 0, col: 0 }, ['plant'])).toBe(false)
  })
})

describe('isInCorner', () => {
  it('needs the room to end on two sides that meet; away from walls, on none', () => {
    const board = buildBoard(
      ['AAA', 'AAA', 'AAA'],
      [{ code: 'A', id: 'a', name: 'A', floor: 'oak', level: 'ground' }],
      [],
    )
    expect(isInCorner(board, { row: 0, col: 0 })).toBe(true)
    expect(isInCorner(board, { row: 2, col: 2 })).toBe(true)
    expect(isInCorner(board, { row: 0, col: 1 })).toBe(false)
    expect(isInCorner(board, { row: 1, col: 1 })).toBe(false)
    expect(isAwayFromWalls(board, { row: 1, col: 1 })).toBe(true)
    expect(isAwayFromWalls(board, { row: 0, col: 1 })).toBe(false)
  })
})

describe('distanceTo', () => {
  it('measures as the crow flies, to the closest piece', () => {
    const board = buildBoard(
      ['AAA', 'AAA', 'AAA'],
      [{ code: 'A', id: 'a', name: 'A', floor: 'oak', level: 'ground' }],
      [
        { kind: 'plant', row: 0, col: 0 },
        { kind: 'plant', row: 2, col: 2 },
      ],
    )
    expect(distanceTo(board, { row: 0, col: 1 }, ['plant'])).toBe(1)
    expect(distanceTo(board, { row: 1, col: 1 }, ['plant'])).toBeCloseTo(Math.SQRT2)
    expect(distanceTo(board, { row: 0, col: 0 }, ['bike'])).toBe(Infinity)
  })
})
