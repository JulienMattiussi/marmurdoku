<script setup lang="ts">
import { computed } from 'vue'
import { CELL } from '@/lib/geometry'
import { outline, type Highlight } from '@/lib/highlights'

/**
 * The places a pointed clue names: rooms and lines framed, furniture filled,
 * green when forced, red when forbidden, blue for a landmark. Forbidden ones
 * are also dashed, not to tell them by color alone.
 */
const props = defineProps<{ highlights: Highlight[] }>()

const drawn = computed(() =>
  [...props.highlights]
    // Fills under frames: a framed room stays readable over its furniture.
    .sort((a, b) => (a.shape === b.shape ? 0 : a.shape === 'fill' ? -1 : 1))
    .map((highlight) => ({
      ...highlight,
      edges: outline(highlight.cells).map((edge) => ({
        x1: edge.x1 * CELL,
        y1: edge.y1 * CELL,
        x2: edge.x2 * CELL,
        y2: edge.y2 * CELL,
      })),
    })),
)
</script>

<template>
  <g class="highlights" aria-hidden="true">
    <g
      v-for="highlight in drawn"
      :key="highlight.key"
      :class="[`highlight--${highlight.shape}`, `highlight--${highlight.mark}`]"
    >
      <template v-if="highlight.shape === 'fill'">
        <rect
          v-for="cell in highlight.cells"
          :key="`${cell.row}-${cell.col}`"
          :x="cell.col * CELL"
          :y="cell.row * CELL"
          :width="CELL"
          :height="CELL"
        />
      </template>
      <line v-for="(edge, i) in highlight.edges" :key="i" v-bind="edge" />
    </g>
  </g>
</template>

<style scoped>
.highlights {
  pointer-events: none;
}
.highlight--forced {
  --mark: #1f9d55;
}
.highlight--forbidden {
  --mark: var(--color-blood-bright);
}
.highlight--landmark {
  --mark: var(--color-landmark);
}
.highlights rect {
  fill: var(--mark);
  opacity: 0.35;
}
.highlights line {
  stroke: var(--mark);
  stroke-linecap: round;
}
.highlight--fill line {
  stroke-width: 3;
}
.highlight--frame line {
  stroke-width: 6;
}
.highlight--forbidden line {
  stroke-dasharray: 10 6;
  stroke-linecap: butt;
}
</style>
