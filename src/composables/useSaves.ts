import { ref } from 'vue'
import type { GameState } from '@/lib/game'
import { addSave, parseSaves, removeSave, type Save } from '@/lib/saves'

const STORAGE_KEY = 'marmurdoku:saves'

/**
 * The player's saved grids, kept in this browser's localStorage. Storage can
 * be missing or full (private window, blocked site data): the list then lives
 * only for the session, and the game never breaks over it.
 */
export const useSaves = () => {
  const read = () => {
    try {
      return parseSaves(localStorage.getItem(STORAGE_KEY))
    } catch {
      return []
    }
  }
  const saves = ref<Save[]>(read())
  const write = (next: Save[]) => {
    saves.value = next
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Kept in memory only.
    }
  }
  return {
    saves,
    save: (name: string, state: GameState) => write(addSave(saves.value, name, state, Date.now())),
    remove: (id: string) => write(removeSave(saves.value, id)),
  }
}
