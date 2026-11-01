import type { Cell } from '@/lib/grid'
import type { Placements } from '@/lib/rules'
import { parseCellName } from '@/lib/geometry'

/**
 * Looks a person takes on during the reconstruction: asleep (floating "Z"),
 * singing (floating notes), blurred (in the shower), jolting left and right
 * (at the foosball table, out of step with each other), fallen.
 */
type Effect = 'zzz' | 'music' | 'blur' | 'sway' | 'swayBack' | 'fallen'

export interface Line {
  person: string
  text: string
}

/** Someone walking cell by cell, by map coordinate ("B3"), from where they stand. */
interface Walk {
  person: string
  path: string[]
  /** Goes into another room, through a door the map does not draw. */
  enters?: boolean
}

export interface PersonEffect {
  person: string
  effect: Effect
}

/** One moment of a scene: walks first, then the line stays up for its reading time. */
interface Beat {
  say?: Line
  walk?: Walk[]
  /** Effects that start with this beat and last until the end of the scene. */
  effects?: PersonEffect[]
  /** How long the beat lasts once the walks are done; by default, the line's reading time. */
  ms?: number
}

/**
 * A scene: the camera zooms on its cast, the beats play, then it zooms out.
 * Walkers stay where they went; effects last until the next scene, and the
 * last scene's (the murder) stay on behind the end message.
 */
export interface Scene {
  cast: string[]
  beats: Beat[]
  /** More cells to keep in the frame, by map coordinate: where a walker comes in, say. */
  frame?: string[]
  /** The frame itself, when the one made around the cast shows too much (a neighbor). */
  shot?: Camera
}

/** What the camera frames, in cells: a square from its top-left corner. */
export interface Camera {
  row: number
  col: number
  size: number
}

/** One still of the reconstruction, shown for `ms` (a null camera shows the whole map). */
export interface Frame {
  camera: Camera | null
  positions: Placements
  lines: Line[]
  effects: PersonEffect[]
  ms: number
}

export const ZOOM_MS = 1300
const STEP_MS = 450
/** Cells kept around the cast, enough for a speech bubble above a head. */
const PADDING = 1.5
const MIN_SIZE = 5

const readingMs = (text: string) => Math.min(Math.max(1000 + 70 * text.length, 2200), 5500)

/** A square of at least MIN_SIZE cells around these cells, padded, and kept on the map. */
export const frameAround = (cells: Cell[], mapSize: number): Camera => {
  const rows = cells.map((cell) => cell.row)
  const cols = cells.map((cell) => cell.col)
  const top = Math.min(...rows) - PADDING
  const left = Math.min(...cols) - PADDING
  const size = Math.min(
    mapSize,
    Math.max(
      MIN_SIZE,
      Math.max(...rows) + PADDING + 1 - top,
      Math.max(...cols) + PADDING + 1 - left,
    ),
  )
  const centered = (start: number, span: number) =>
    Math.min(Math.max(start - (size - span) / 2, 0), mapSize - size)
  return {
    row: centered(top, Math.max(...rows) + PADDING + 1 - top),
    col: centered(left, Math.max(...cols) + PADDING + 1 - left),
    size,
  }
}

/**
 * The script as stills: for each scene, a zoom in, its beats (a still per
 * walking step), a zoom out. Walkers stay where they went for the next scenes.
 */
export const timeline = (scenes: Scene[], placements: Placements, mapSize: number): Frame[] => {
  const frames: Frame[] = []
  let positions = { ...placements }
  for (const scene of scenes) {
    // Framed where the cast ends up: walkers may come in from off the frame, for a tighter zoom.
    const ends = { ...positions }
    for (const { person, path } of scene.beats.flatMap((beat) => beat.walk ?? [])) {
      ends[person] = parseCellName(path.at(-1)!)
    }
    const camera =
      scene.shot ??
      frameAround(
        [...scene.cast.flatMap((id) => ends[id] ?? []), ...(scene.frame ?? []).map(parseCellName)],
        mapSize,
      )
    // The first beat's effects are on before the zoom starts (Benoît already blurred).
    let effects: PersonEffect[] = scene.beats[0]?.effects ?? []
    frames.push({ camera, positions, lines: [], effects, ms: ZOOM_MS })
    for (const [i, beat] of scene.beats.entries()) {
      if (i > 0) effects = [...effects, ...(beat.effects ?? [])]
      const lines = beat.say ? [beat.say] : []
      const steps = Math.max(0, ...(beat.walk ?? []).map((walk) => walk.path.length))
      for (let step = 0; step < steps; step++) {
        positions = { ...positions }
        for (const { person, path } of beat.walk ?? []) {
          const cell = path[step]
          if (cell) positions[person] = parseCellName(cell)
        }
        frames.push({ camera, positions, lines, effects, ms: STEP_MS })
      }
      const ms = beat.ms ?? (beat.say ? readingMs(beat.say.text) : STEP_MS)
      frames.push({ camera, positions, lines, effects, ms })
    }
    // Effects last through the zoom out (Benoît still blurred), until the next scene.
    frames.push({ camera: null, positions, lines: [], effects, ms: ZOOM_MS })
  }
  return frames
}

/**
 * A line broken into rows of at most `width` characters, at spaces. French
 * punctuation set off by a space ("?", "!", "…") stays with its word.
 */
export const wrap = (text: string, width: number) =>
  text.split(' ').reduce<string[]>((rows, word) => {
    const last = rows[rows.length - 1]
    const glued = /^[?!:;…»]+$/.test(word)
    if (last !== undefined && (glued || `${last} ${word}`.length <= width))
      rows[rows.length - 1] = `${last} ${word}`
    else rows.push(word)
    return rows
  }, [])
