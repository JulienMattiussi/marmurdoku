<script setup lang="ts">
import { CELL, columnName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'

/**
 * Column letters and row numbers on the four sides of the map, in the margin
 * the map leaves around itself. Zoomed in, they no longer match: they fade out.
 */
const props = defineProps<{
  /** Cells on a side of the map. */
  cells: number
  /** Room around the map, in map units. */
  margin: number
  zoomed: boolean
  /** The cell pointed at: its letter and number stand out. */
  pointed?: Cell | null
}>()

const size = props.cells * CELL
const ticks = Array.from({ length: props.cells }, (_, i) => ({ i, at: i * CELL + CELL / 2 }))
</script>

<template>
  <g class="coordinates" :class="{ 'coordinates--zoomed': zoomed }" aria-hidden="true">
    <template v-for="tick in ticks" :key="tick.i">
      <g :class="{ 'coordinates--pointed': pointed?.col === tick.i }">
        <text :x="tick.at" :y="-margin / 2">{{ columnName(tick.i) }}</text>
        <text :x="tick.at" :y="size + margin / 2">{{ columnName(tick.i) }}</text>
      </g>
      <g :class="{ 'coordinates--pointed': pointed?.row === tick.i }">
        <text :x="-margin / 2" :y="tick.at">{{ tick.i + 1 }}</text>
        <text :x="size + margin / 2" :y="tick.at">{{ tick.i + 1 }}</text>
      </g>
    </template>
  </g>
</template>

<style scoped>
.coordinates {
  transition: opacity 0.6s;
}
.coordinates--zoomed {
  opacity: 0;
}
.coordinates text {
  font-size: 13px;
  font-weight: 600;
  fill: var(--color-bone);
  text-anchor: middle;
  dominant-baseline: central;
}
.coordinates .coordinates--pointed text {
  fill: var(--color-tape);
  font-size: 16px;
}
@media (prefers-reduced-motion: reduce) {
  .coordinates {
    transition: none;
  }
}
</style>
