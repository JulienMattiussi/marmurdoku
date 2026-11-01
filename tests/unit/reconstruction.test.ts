import { PEOPLE } from '@/data/people'
import { RECONSTRUCTION } from '@/data/reconstruction'
import { frameAround, timeline, wrap, ZOOM_MS } from '@/lib/reconstruction'
import { parseCellName } from '@/lib/geometry'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

const SIZE = PUZZLE.board.size

describe('the reconstruction script', () => {
  const ids = new Set(PEOPLE.map((person) => person.id))

  it('only names people of the cast', () => {
    for (const scene of RECONSTRUCTION) {
      for (const id of scene.cast) expect(ids).toContain(id)
      for (const beat of scene.beats) {
        if (beat.say) expect(ids).toContain(beat.say.person)
        for (const walk of beat.walk ?? []) expect(ids).toContain(walk.person)
      }
    }
  })

  it('walks step by step, on cells one can stand on, through a wall only to enter a room', () => {
    const { zones, placeable } = PUZZLE.board
    // Walkers stay where they went: each walk starts from the end of the last one.
    const at = { ...SOLUTION_PLACEMENTS }
    for (const scene of RECONSTRUCTION) {
      for (const { person, path, enters } of scene.beats.flatMap((beat) => beat.walk ?? [])) {
        let from = at[person]!
        let rooms = 0
        for (const name of path) {
          const to = parseCellName(name)
          expect(Math.abs(to.row - from.row) + Math.abs(to.col - from.col), name).toBe(1)
          expect(placeable[to.row]![to.col], name).toBe(true)
          if (zones[to.row]![to.col] !== zones[from.row]![from.col]) rooms++
          from = to
        }
        expect(rooms, person).toBe(enters ? 1 : 0)
        at[person] = from
      }
    }
  })

  it('ends on the murder, Thiery and François', () => {
    expect(RECONSTRUCTION.at(-1)!.cast).toEqual(['thiery', 'francois'])
  })
})

describe('timeline', () => {
  const frames = timeline(RECONSTRUCTION, SOLUTION_PLACEMENTS, SIZE)

  it('zooms in and out of each scene', () => {
    expect(frames[0]!.camera).not.toBeNull()
    expect(frames[0]!.ms).toBe(ZOOM_MS)
    expect(frames.filter((frame) => frame.camera === null)).toHaveLength(RECONSTRUCTION.length)
  })

  it('walks one cell per still, leaves walkers where they went, keeps effects until the next scene', () => {
    expect(frames.some((frame) => frame.positions.anthony?.col === 11)).toBe(true)
    const zoomOuts = frames.filter((frame) => frame.camera === null)
    expect(zoomOuts[0]!.positions).toEqual(SOLUTION_PLACEMENTS)
    expect(zoomOuts[0]!.effects).toEqual([{ person: 'antoine', effect: 'zzz' }])
    const nextZoomIn = frames[frames.indexOf(zoomOuts[0]!) + 1]!
    expect(nextZoomIn.effects).toEqual([])
    const last = zoomOuts.at(-1)!
    expect(last.positions.anthony).toEqual(parseCellName('K19'))
    expect(last.positions.thiery).toEqual(parseCellName('N1'))
    expect(last.effects).toContainEqual({ person: 'francois', effect: 'fallen' })
  })
})

describe('frameAround', () => {
  it('frames a square of at least 5 cells, kept on the map', () => {
    expect(frameAround([{ row: 0, col: 0 }], SIZE)).toEqual({ row: 0, col: 0, size: 5 })
    const camera = frameAround([parseCellName('N18'), parseCellName('G20')], SIZE)
    expect(camera.row + camera.size).toBeLessThanOrEqual(SIZE)
    expect(camera.size).toBeGreaterThanOrEqual(10)
  })
})

describe('wrap', () => {
  it('breaks a line at spaces', () => {
    expect(wrap('Je ne peux pas m’en empêcher', 12)).toEqual(['Je ne peux', 'pas m’en', 'empêcher'])
  })

  it('keeps a question mark with its word, a little past the width if need be', () => {
    expect(wrap('T’en as une pour moi aussi ?', 26)).toEqual(['T’en as une pour moi aussi ?'])
  })
})
