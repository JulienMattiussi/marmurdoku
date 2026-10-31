<script setup lang="ts">
import { computed } from 'vue'
import { CELL, cellName } from '@/lib/geometry'
import { parseCellName } from '@/lib/solution'
import type { Cell } from '@/lib/grid'

/**
 * The player's layer over the map: crosses, the cell under a dragged person,
 * and one invisible target per placeable cell (`data-cell` lets drags find
 * it). Cells nobody can stand on take neither clicks nor drops.
 */
const props = defineProps<{
  placeable: boolean[][]
  crosses: string[]
  hoverCell: Cell | null
  /** Cell of the picked person, if they are on the map. */
  selectedCell: Cell | null
}>()

const emit = defineEmits<{
  click: [cell: Cell]
  press: [cell: Cell, event: PointerEvent]
}>()

const targets = props.placeable.flatMap((row, r) =>
  row.flatMap((free, c) =>
    free ? [{ name: cellName({ row: r, col: c }), x: c * CELL, y: r * CELL }] : [],
  ),
)

const crossCells = computed(() => props.crosses.map((name) => ({ name, ...parseCellName(name) })))

const frame = (cell: Cell | null) => (cell ? { x: cell.col * CELL, y: cell.row * CELL } : null)
const hover = computed(() => frame(props.hoverCell))
const selected = computed(() => frame(props.selectedCell))
</script>

<template>
  <g v-for="cross in crossCells" :key="cross.name" class="cross" aria-hidden="true">
    <path :d="`M${cross.col * CELL + 14} ${cross.row * CELL + 14}l20 20m0 -20l-20 20`" />
  </g>

  <rect
    v-if="selected"
    :x="selected.x + 2"
    :y="selected.y + 2"
    :width="CELL - 4"
    :height="CELL - 4"
    rx="6"
    class="selected-cell"
  />
  <rect
    v-if="hover"
    :x="hover.x + 2"
    :y="hover.y + 2"
    :width="CELL - 4"
    :height="CELL - 4"
    rx="6"
    class="hover-cell"
  />

  <rect
    v-for="target in targets"
    :key="target.name"
    :data-cell="target.name"
    :x="target.x"
    :y="target.y"
    :width="CELL"
    :height="CELL"
    class="target"
    @click="emit('click', parseCellName(target.name))"
    @pointerdown="emit('press', parseCellName(target.name), $event)"
  >
    <title>{{ target.name }}</title>
  </rect>
</template>

<style scoped>
.cross path {
  stroke: var(--color-blood);
  stroke-width: 4;
  stroke-linecap: round;
  opacity: 0.75;
}
.target {
  fill: transparent;
  cursor: pointer;
  touch-action: none;
}
.target:hover {
  fill: rgb(255 255 255 / 18%);
}
.hover-cell {
  fill: rgb(225 37 47 / 30%);
  stroke: var(--color-blood-bright);
  stroke-width: 3;
}
.selected-cell {
  fill: none;
  stroke: var(--color-tape);
  stroke-width: 3;
  stroke-dasharray: 6 4;
}
</style>
