import type { GameState } from '@/lib/game'

/** A grid the player saved, to load it back later. */
export interface Save {
  id: string
  name: string
  /** When it was saved, in milliseconds since 1970. */
  at: number
  state: GameState
}

export const addSave = (saves: Save[], name: string, state: GameState, at: number): Save[] => [
  { id: `${at}-${saves.length}`, name: name.trim() || defaultName(at), at, state },
  ...saves,
]

export const removeSave = (saves: Save[], id: string): Save[] =>
  saves.filter((save) => save.id !== id)

export const defaultName = (at: number) =>
  `Partie du ${new Date(at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}`

const isState = (value: unknown): value is GameState => {
  const state = value as GameState
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof state.placements === 'object' &&
    Array.isArray(state.crosses) &&
    typeof state.notes === 'object'
  )
}

/** Reads saves stored as JSON; anything unreadable is dropped rather than breaking the game. */
export const parseSaves = (json: string | null): Save[] => {
  if (!json) return []
  try {
    const value: unknown = JSON.parse(json)
    if (!Array.isArray(value)) return []
    return value.filter(
      (save): save is Save =>
        typeof save?.id === 'string' &&
        typeof save?.name === 'string' &&
        typeof save?.at === 'number' &&
        isState(save?.state),
    )
  } catch {
    return []
  }
}
