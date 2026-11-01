<script setup lang="ts">
import { computed } from 'vue'
import { CELL } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import { wrap, type Camera, type Line, type PersonEffect } from '@/lib/reconstruction'

/**
 * Over the people during the reconstruction: speech bubbles, floating "Z" and
 * notes. Sizes follow the camera, so that a bubble reads the same whatever
 * the zoom.
 */
const props = defineProps<{
  positions: Record<string, Cell>
  lines: Line[]
  effects: PersonEffect[]
  camera: Camera
  /** The map's side, in cells. */
  mapSize: number
}>()

/**
 * The bubbles' unit, in map units: it shrinks as the camera zooms in, so that
 * a bubble shows at the same size on screen whatever the zoom (about 15px of
 * text on a map 700px wide).
 */
const scale = computed(() => (props.camera.size / props.mapSize) * 2.6)
const FONT = 9
const WRAP = 26

const center = (cell: Cell) => ({ x: (cell.col + 0.5) * CELL, y: (cell.row + 0.5) * CELL })

const bubbles = computed(() =>
  props.lines.flatMap(({ person, text }) => {
    const cell = props.positions[person]
    if (!cell) return []
    const k = scale.value
    const rows = wrap(text, WRAP)
    const font = FONT * k
    const width = Math.max(...rows.map((row) => row.length)) * font * 0.62 + 14 * k
    const height = rows.length * font * 1.25 + 10 * k
    const { x, y } = center(cell)
    const left = props.camera.col * CELL + 4 * k
    const right = (props.camera.col + props.camera.size) * CELL - 4 * k
    const boxX = Math.min(Math.max(x - width / 2, left), right - width)
    const above = y - CELL / 2 - 10 * k - height > props.camera.row * CELL
    const boxY = above ? y - CELL / 2 - 8 * k - height : y + CELL / 2 + 8 * k
    // Drawn from the box's corner, which moves with the speaker (see .bubble).
    const tipX = x - boxX
    const tail = above
      ? `M${tipX - 5 * k} ${height}L${tipX} ${height + 8 * k}L${tipX + 5 * k} ${height}`
      : `M${tipX - 5 * k} 0L${tipX} ${-8 * k}L${tipX + 5 * k} 0`
    return [
      {
        key: `${person}:${text}`,
        at: `translate(${boxX}px, ${boxY}px)`,
        rect: { width, height, rx: 6 * k },
        tail,
        stroke: 1.5 * k,
        font,
        rows: rows.map((row, i) => ({
          text: row,
          x: width / 2,
          y: 5 * k + font * (i + 0.95) * 1.2,
        })),
      },
    ]
  }),
)

const marks = computed(() =>
  props.effects.flatMap(({ person, effect }) => {
    const cell = props.positions[person]
    return cell ? [{ key: `${person}:${effect}`, effect, ...center(cell) }] : []
  }),
)
</script>

<template>
  <g class="reconstruction" aria-hidden="true">
    <template v-for="mark in marks" :key="mark.key">
      <g
        v-if="mark.effect === 'zzz'"
        class="floating"
        :style="{ transform: `translate(${mark.x + 10}px, ${mark.y - 22}px)` }"
      >
        <text class="zzz" style="--delay: 0s">Z</text>
        <text class="zzz" style="--delay: 0.8s">Z</text>
        <text class="zzz" style="--delay: 1.6s">Z</text>
      </g>
      <g
        v-else-if="mark.effect === 'music'"
        class="floating"
        :style="{ transform: `translate(${mark.x + 12}px, ${mark.y - 18}px)` }"
      >
        <text class="note" style="--delay: 0s">♪</text>
        <text class="note" style="--delay: 0.7s">♫</text>
        <text class="note" style="--delay: 1.4s">♪</text>
      </g>
    </template>

    <g v-for="bubble in bubbles" :key="bubble.key" class="bubble" :style="{ transform: bubble.at }">
      <rect v-bind="bubble.rect" :stroke-width="bubble.stroke" />
      <path :d="bubble.tail" :stroke-width="bubble.stroke" />
      <text
        v-for="row in bubble.rows"
        :key="row.text"
        :x="row.x"
        :y="row.y"
        :font-size="bubble.font"
      >
        {{ row.text }}
      </text>
    </g>
  </g>
</template>

<style scoped>
/* A bubble follows its speaker's walk, at the same pace (PeopleLayer's .person--walking). */
.bubble {
  transition: transform 0.42s linear;
}
.bubble rect,
.bubble path {
  fill: var(--color-paper);
  stroke: var(--color-ink);
}
.bubble text {
  font-family: var(--font-sans);
  fill: var(--color-ink);
  text-anchor: middle;
}
.zzz,
.note {
  font-family: var(--font-sans);
  font-weight: bold;
  opacity: 0;
  animation: float 2.4s ease-out var(--delay) infinite;
}
.zzz {
  font-size: 14px;
  fill: #1565c0;
}
.note {
  font-size: 16px;
  fill: var(--color-blood);
}
@keyframes float {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.7);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(12px, -26px) scale(1.2);
  }
}
@media (prefers-reduced-motion: reduce) {
  .bubble {
    transition: none;
  }
  .zzz,
  .note {
    animation: none;
    opacity: 1;
  }
  .zzz:nth-child(2),
  .note:nth-child(2) {
    transform: translate(8px, -12px);
  }
  .zzz:nth-child(3),
  .note:nth-child(3) {
    transform: translate(16px, -24px);
  }
}
</style>
