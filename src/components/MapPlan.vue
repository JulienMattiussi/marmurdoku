<script setup lang="ts">
import FurniturePiece from '@/components/FurniturePiece.vue'
import { FURNITURE, ZONE_GRID } from '@/data/office'
import { ZONES } from '@/data/zones'
import { placeableGrid, seatedCells } from '@/lib/furniture'
import { CELL } from '@/lib/geometry'
import { parseZoneGrid } from '@/lib/grid'
import { zoneBoundaries } from '@/lib/walls'

/**
 * The office plan itself, nobody on it: floors, furniture, the dashed grid,
 * walls and fences, room names. Drawn in map units (CELL per cell), inside an
 * <svg> that brings the floor patterns (FloorPatterns.vue).
 */
defineProps<{
  /** Debug: hatch the cells where nobody can stand. */
  showBlocked?: boolean
}>()

const zones = parseZoneGrid(ZONE_GRID, ZONES)
const size = zones.length * CELL
const placeable = placeableGrid(zones, FURNITURE)

/** Rows of yard drawn below the map, only ever seen by the reconstruction's camera. */
const BELOW = 4

const cells = zones.flatMap((row, r) =>
  row.map((zone, c) => ({
    key: `${r}-${c}`,
    x: c * CELL,
    y: r * CELL,
    fill: zone ? `url(#floor-${zone.floor})` : 'url(#void)',
  })),
)

const blocked = zones.flatMap((row, r) =>
  row.flatMap((zone, c) =>
    zone && !placeable[r]![c] ? [{ key: `${r}-${c}`, x: c * CELL, y: r * CELL }] : [],
  ),
)

const segments = zoneBoundaries(zones).map((s, i) => ({
  ...s,
  key: i,
  x1: s.x1 * CELL,
  y1: s.y1 * CELL,
  x2: s.x2 * CELL,
  y2: s.y2 * CELL,
}))

/** Rugs first, so the pieces standing on them are drawn on top. */
const furniture = [
  ...FURNITURE.filter((p) => p.kind === 'rug'),
  ...FURNITURE.filter((p) => p.kind !== 'rug'),
].map((piece) => ({
  piece,
  seated: piece.kind === 'desk' ? seatedCells(piece, FURNITURE) : undefined,
}))

/** Room names, written in the bottom-left cell of each room. */
const labels = ZONES.map((zone) => {
  const r = zones.length - 1 - [...zones].reverse().findIndex((row) => row.includes(zone))
  const c = zones[r]!.indexOf(zone)
  return { id: zone.id, name: zone.name, x: c * CELL + 9, y: (r + 1) * CELL - 8 }
})
</script>

<template>
  <!-- More yard below the map, for a camera centered on the yard's people. -->
  <rect
    :y="size"
    :width="size"
    :height="BELOW * CELL"
    :fill="`url(#floor-${zones.at(-1)![0]!.floor})`"
  />
  <g class="grid-lines">
    <path v-for="i in zones.length - 1" :key="i" :d="`M${i * CELL} ${size}v${BELOW * CELL}`" />
    <path v-for="j in BELOW" :key="`below-${j}`" :d="`M0 ${size + j * CELL}H${size}`" />
  </g>

  <rect
    v-for="cell in cells"
    :key="cell.key"
    :x="cell.x"
    :y="cell.y"
    :width="CELL"
    :height="CELL"
    :fill="cell.fill"
  />

  <FurniturePiece
    v-for="(item, i) in furniture"
    :key="i"
    :piece="item.piece"
    :seated="item.seated"
  />

  <g class="grid-lines">
    <path
      v-for="i in zones.length - 1"
      :key="i"
      :d="`M${i * CELL} 0V${size}M0 ${i * CELL}H${size}`"
    />
  </g>

  <g v-for="s in segments" :key="s.key" :class="`boundary boundary--${s.style}`">
    <line :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2" />
  </g>

  <g v-if="showBlocked" class="blocked">
    <rect
      v-for="cell in blocked"
      :key="cell.key"
      :x="cell.x"
      :y="cell.y"
      :width="CELL"
      :height="CELL"
    />
  </g>

  <g v-for="label in labels" :key="label.id" class="zone-label">
    <text :x="label.x" :y="label.y">{{ label.name }}</text>
  </g>
</template>

<style scoped>
.blocked rect {
  fill: rgb(215 38 61 / 22%);
}
.grid-lines path {
  stroke: rgb(27 30 38 / 32%);
  stroke-width: 1.5;
  stroke-dasharray: 5 3;
}
.boundary line {
  stroke-linecap: round;
}
.boundary--wall line {
  stroke: var(--color-wall);
  stroke-width: 6;
}
.boundary--fence line {
  stroke: #8a8270;
  stroke-width: 3;
  stroke-dasharray: 2 6;
}
.boundary--railing line {
  stroke: #f7f4ef;
  stroke-width: 4;
  stroke-dasharray: 3 5;
}
.boundary--floor line {
  stroke: var(--color-wall);
  stroke-width: 8;
}
.zone-label text {
  /* Narrower than the typewriter font: names must fit their room. */
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  fill: var(--color-ink);
  paint-order: stroke;
  stroke: rgb(255 255 255 / 85%);
  stroke-width: 3px;
  stroke-linejoin: round;
}
</style>
