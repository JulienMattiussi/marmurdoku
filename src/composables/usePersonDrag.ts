import { ref } from 'vue'
import type { Cell } from '@/lib/grid'
import { parseCellName } from '@/lib/solution'

/** Pixels the pointer must travel before a press becomes a drag (below that, it is a click). */
const THRESHOLD = 6

/**
 * Dragging a person with the pointer (mouse or touch), from the cast or from
 * the map. Cells are found under the pointer through their `data-cell`
 * attribute, so only the cells that carry one accept a drop.
 */
export const usePersonDrag = (onDrop: (person: string, cell: Cell) => void) => {
  const dragged = ref<{ person: string; x: number; y: number } | null>(null)
  const hoverCell = ref<Cell | null>(null)
  /** Set while the click that follows a drag must be ignored. */
  let justDragged = false

  const cellUnder = (x: number, y: number) => {
    const name = document.elementFromPoint(x, y)?.closest<SVGElement>('[data-cell]')?.dataset.cell
    return name ? parseCellName(name) : null
  }

  const press = (person: string, event: PointerEvent) => {
    if (event.button !== 0) return
    const start = { x: event.clientX, y: event.clientY }
    const move = (e: PointerEvent) => {
      if (!dragged.value && Math.hypot(e.clientX - start.x, e.clientY - start.y) < THRESHOLD) return
      dragged.value = { person, x: e.clientX, y: e.clientY }
      hoverCell.value = cellUnder(e.clientX, e.clientY)
    }
    const release = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
      if (!dragged.value) return
      if (hoverCell.value) onDrop(person, hoverCell.value)
      dragged.value = null
      hoverCell.value = null
      justDragged = true
      setTimeout(() => (justDragged = false))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
  }

  return { dragged, hoverCell, press, wasDragging: () => justDragged }
}
