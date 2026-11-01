<script setup lang="ts">
import { computed } from 'vue'
import { colorOf, initialOf, inkOn, PEOPLE } from '@/data/people'
import { CELL, parseCellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'

/**
 * The positions the player noted: in each cell, one disc per suspect, their
 * initial on their own color, three by three. Notes of suspects
 * already placed are hidden (their data stays, should they leave their cell).
 * The picked suspect's notes get a yellow ring.
 */
const props = defineProps<{
  notes: Record<string, string[]>
  placements: Record<string, Cell>
  selected: string | null
}>()

const SLOT = 15
const PER_ROW = 3

const marks = computed(() => {
  const byCell = new Map<string, string[]>()
  for (const { id } of PEOPLE) {
    if (props.placements[id]) continue
    for (const name of props.notes[id] ?? []) byCell.set(name, [...(byCell.get(name) ?? []), id])
  }
  return [...byCell].flatMap(([name, ids]) => {
    const { row, col } = parseCellName(name)
    return ids.slice(0, PER_ROW * PER_ROW).map((id, i) => ({
      key: `${name}-${id}`,
      cx: col * CELL + 1.5 + (i % PER_ROW) * SLOT + SLOT / 2,
      cy: row * CELL + 1.5 + Math.floor(i / PER_ROW) * SLOT + SLOT / 2,
      color: colorOf(id),
      ink: inkOn(id),
      initial: initialOf(id),
      picked: id === props.selected,
    }))
  })
})
</script>

<template>
  <g class="notes" aria-hidden="true">
    <g v-for="mark in marks" :key="mark.key" class="note">
      <circle
        :cx="mark.cx"
        :cy="mark.cy"
        :r="SLOT / 2 - 0.5"
        :fill="mark.color"
        :class="{ 'note--picked': mark.picked }"
      />
      <text :x="mark.cx" :y="mark.cy" :fill="mark.ink">{{ mark.initial }}</text>
    </g>
  </g>
</template>

<style scoped>
.notes {
  pointer-events: none;
}
.note circle {
  stroke: rgb(255 255 255 / 85%);
  stroke-width: 1;
}
.note circle.note--picked {
  stroke: var(--color-tape);
  stroke-width: 2.5;
}
.note text {
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 10px;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: central;
}
</style>
