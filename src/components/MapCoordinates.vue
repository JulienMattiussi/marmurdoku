<script setup lang="ts">
import { CELL, columnName } from '@/lib/geometry'

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
}>()

const size = props.cells * CELL
const ticks = Array.from({ length: props.cells }, (_, i) => ({ i, at: i * CELL + CELL / 2 }))
</script>

<template>
  <g class="coordinates" :class="{ 'coordinates--zoomed': zoomed }" aria-hidden="true">
    <template v-for="tick in ticks" :key="tick.i">
      <text :x="tick.at" :y="-margin / 2">{{ columnName(tick.i) }}</text>
      <text :x="tick.at" :y="size + margin / 2">{{ columnName(tick.i) }}</text>
      <text :x="-margin / 2" :y="tick.at">{{ tick.i + 1 }}</text>
      <text :x="size + margin / 2" :y="tick.at">{{ tick.i + 1 }}</text>
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
@media (prefers-reduced-motion: reduce) {
  .coordinates {
    transition: none;
  }
}
</style>
