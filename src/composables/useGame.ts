import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  clickCell,
  clickEffect,
  dropPerson,
  emptyGame,
  isSolved,
  type GameState,
  type Mode,
} from '@/lib/game'
import { cellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import { record, redo, startHistory, undo } from '@/lib/history'
import type { Puzzle } from '@/lib/solver'

/** A wrong guess shows this long before the game goes on. */
const WRONG_MESSAGE_MS = 2500

/**
 * The game as the page plays it: the undo history of moves, who is picked,
 * place or note mode, and the verdict of "Vérifier". Once the case is closed,
 * nothing moves any more. Ctrl+Z undoes, Ctrl+Y or Ctrl+Shift+Z redoes.
 */
export const useGame = (puzzle: Puzzle, start: GameState = emptyGame()) => {
  const history = ref(startHistory(start))
  const selected = ref<string | null>(null)
  const mode = ref<Mode>('place')
  const verdict = ref<'solved' | 'wrong' | null>(null)
  const over = computed(() => verdict.value === 'solved')
  const state = computed(() => history.value.present)

  const play = (next: GameState) => {
    if (!over.value) history.value = record(history.value, next)
  }

  const select = (person: string) => {
    if (!over.value) selected.value = selected.value === person ? null : person
  }

  const click = (cell: Cell) => {
    play(clickCell(state.value, cell, selected.value, mode.value))
    // A placement is done with the pick; notes keep it, to note several cells.
    if (mode.value === 'place' && selected.value && state.value.placements[selected.value]) {
      selected.value = null
    }
  }

  /** Loading a saved grid is one move: undo goes back to the grid before it. */
  const load = (saved: GameState) => play(saved)

  const drop = (person: string, cell: Cell) => {
    play(dropPerson(state.value, person, cell))
    selected.value = null
  }

  const occupantOf = (cell: Cell) =>
    Object.keys(state.value.placements).find(
      (id) => cellName(state.value.placements[id]!) === cellName(cell),
    )

  const effect = computed(() => clickEffect(selected.value, mode.value))
  /** The cross tool: with nobody picked, a click crosses out. */
  const deselect = () => (selected.value = null)

  const everyonePlaced = computed(() => puzzle.people.every((id) => state.value.placements[id]))
  const verify = () => {
    if (isSolved(puzzle, state.value.placements)) {
      verdict.value = 'solved'
      selected.value = null
      return
    }
    verdict.value = 'wrong'
    setTimeout(() => (verdict.value = null), WRONG_MESSAGE_MS)
  }

  const canUndo = computed(() => !over.value && history.value.past.length > 0)
  const canRedo = computed(() => !over.value && history.value.future.length > 0)
  const back = () => {
    if (canUndo.value) history.value = undo(history.value)
  }
  const forward = () => {
    if (canRedo.value) history.value = redo(history.value)
  }

  const onKey = (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey)) return
    const key = event.key.toLowerCase()
    if (key === 'z' && !event.shiftKey) back()
    else if (key === 'y' || (key === 'z' && event.shiftKey)) forward()
    else return
    event.preventDefault()
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onUnmounted(() => window.removeEventListener('keydown', onKey))

  return {
    state,
    selected,
    mode,
    verdict,
    over,
    everyonePlaced,
    effect,
    canUndo,
    canRedo,
    select,
    deselect,
    click,
    drop,
    load,
    occupantOf,
    verify,
    undo: back,
    redo: forward,
  }
}
