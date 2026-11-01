<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { CELL, cellName, parseCellName } from '@/lib/geometry'
import type { Tool } from '@/lib/game'
import type { Cell } from '@/lib/grid'

/**
 * The player's layer over the map: crosses, the cell under a dragged person,
 * a tooltip naming what stands on a cell after a second of hovering, and one
 * invisible target per room cell. Only placeable cells carry `data-cell`
 * (which lets drags find them) and take clicks and presses.
 */
const props = defineProps<{
  /** Room cells (true) and the void (false). */
  inRoom: boolean[][]
  placeable: boolean[][]
  /** What the tooltip says for each cell, empty for nothing. */
  labels: string[][]
  crosses: string[]
  hoverCell: Cell | null
  /** Cell of the picked person, if they are on the map. */
  selectedCell: Cell | null
  /** What a click does, shown by the cursor over the cells. */
  effect: Tool
}>()

const emit = defineEmits<{
  click: [cell: Cell]
  press: [cell: Cell, event: PointerEvent]
}>()

const TOOLTIP_DELAY_MS = 1000

const targets = props.inRoom.flatMap((row, r) =>
  row.flatMap((room, c) =>
    room
      ? [
          {
            name: cellName({ row: r, col: c }),
            x: c * CELL,
            y: r * CELL,
            free: props.placeable[r]![c]!,
          },
        ]
      : [],
  ),
)

const crossCells = computed(() => props.crosses.map((name) => ({ name, ...parseCellName(name) })))

const frame = (cell: Cell | null) => (cell ? { x: cell.col * CELL, y: cell.row * CELL } : null)
const hover = computed(() => frame(props.hoverCell))
const selected = computed(() => frame(props.selectedCell))

const tip = ref<{ text: string; x: number; y: number; width: number } | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
const hideTip = () => {
  clearTimeout(timer)
  tip.value = null
}
const scheduleTip = (name: string) => {
  hideTip()
  const { row, col } = parseCellName(name)
  const text = props.labels[row]![col]!
  if (!text) return
  timer = setTimeout(() => {
    const width = text.length * 7.6 + 16
    const size = props.inRoom.length * CELL
    const x = Math.min(Math.max(col * CELL + CELL / 2 - width / 2, 0), size - width)
    tip.value = { text, x, y: row === 0 ? CELL + 4 : row * CELL - 26, width }
  }, TOOLTIP_DELAY_MS)
}
onUnmounted(hideTip)

const onClick = (target: (typeof targets)[number]) => {
  if (target.free) emit('click', parseCellName(target.name))
}
const onPress = (target: (typeof targets)[number], event: PointerEvent) => {
  hideTip()
  if (target.free) emit('press', parseCellName(target.name), event)
}
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
    :data-cell="target.free ? target.name : undefined"
    :x="target.x"
    :y="target.y"
    :width="CELL"
    :height="CELL"
    class="target"
    :class="target.free ? ['target--free', `target--${effect}`] : []"
    @click="onClick(target)"
    @pointerdown="onPress(target, $event)"
    @pointerenter="scheduleTip(target.name)"
    @pointerleave="hideTip"
  />

  <g v-if="tip" class="tooltip" aria-hidden="true">
    <rect :x="tip.x" :y="tip.y" :width="tip.width" height="22" rx="3" />
    <text :x="tip.x + tip.width / 2" :y="tip.y + 15">{{ tip.text }}</text>
  </g>
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
}
.target--free {
  touch-action: none;
}
/* The cursor tells what a click will do: place (solid pencil), note (dotted pencil), cross. */
.target--place {
  cursor:
    url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M17 2.5l4.5 4.5-12.5 12.5-6 1.5 1.5-6z%27 fill=%27%231b1e26%27 stroke=%27%23f2c418%27 stroke-width=%271.5%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E')
      3 21,
    pointer;
}
.target--note {
  cursor:
    url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M17 2.5l4.5 4.5-12.5 12.5-6 1.5 1.5-6z%27 fill=%27%23fff%27 fill-opacity=%270.85%27 stroke=%27%231b1e26%27 stroke-width=%271.6%27 stroke-dasharray=%272.5 2%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E')
      3 21,
    pointer;
}
.target--cross {
  cursor:
    url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M5 5l14 14M19 5L5 19%27 stroke=%27%23fff%27 stroke-width=%276%27 stroke-linecap=%27round%27/%3E%3Cpath d=%27M5 5l14 14M19 5L5 19%27 stroke=%27%23b0121e%27 stroke-width=%273%27 stroke-linecap=%27round%27/%3E%3C/svg%3E')
      12 12,
    crosshair;
}
.target--free:hover {
  fill: rgb(255 255 255 / 18%);
}
.tooltip {
  pointer-events: none;
}
.tooltip rect {
  fill: var(--color-ink);
  stroke: var(--color-blood);
  stroke-width: 1.5;
}
.tooltip text {
  fill: var(--color-bone);
  font-size: 13px;
  text-anchor: middle;
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
