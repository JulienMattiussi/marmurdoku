<script setup lang="ts">
import { computed, ref } from 'vue'
import CellLayer from '@/components/CellLayer.vue'
import FloorPatterns from '@/components/FloorPatterns.vue'
import MapCoordinates from '@/components/MapCoordinates.vue'
import MapPlan from '@/components/MapPlan.vue'
import NotesLayer from '@/components/NotesLayer.vue'
import PeopleLayer from '@/components/PeopleLayer.vue'
import ReconstructionLayer from '@/components/ReconstructionLayer.vue'
import { FURNITURE, ZONE_GRID } from '@/data/office'
import { PEOPLE } from '@/data/people'
import { ZONES } from '@/data/zones'
import { placeableGrid } from '@/lib/furniture'
import type { Tool } from '@/lib/game'
import { CELL } from '@/lib/geometry'
import { parseZoneGrid, type Cell } from '@/lib/grid'
import type { Frame } from '@/lib/reconstruction'
import { groundLabels, tooltips } from '@/lib/tooltips'

/**
 * The map as the page shows it: the plan, then the player's layers (notes,
 * people, crosses and click targets), or the reconstruction's still, seen
 * through its camera.
 */
const props = defineProps<{
  /** People on the map, by id. */
  placements: Record<string, Cell>
  crosses: string[]
  /** Positions noted per suspect, drawn as small avatars. */
  notes: Record<string, string[]>
  /** The picked suspect: their notes stand out. */
  selected: string | null
  /** What a click on a cell does: sets the cursor. */
  effect: Tool
  hoverCell: Cell | null
  selectedCell: Cell | null
  /** Debug: hatch the cells where nobody can stand. */
  showBlocked?: boolean
  /** The reconstruction's current still: it takes over the people, the camera and the bubbles. */
  still?: Frame
}>()

const emit = defineEmits<{
  cellClick: [cell: Cell]
  cellPress: [cell: Cell, event: PointerEvent]
}>()

const zones = parseZoneGrid(ZONE_GRID, ZONES)
const size = zones.length * CELL
const placeable = placeableGrid(zones, FURNITURE)
const inRoom = zones.map((row) => row.map(Boolean))

/** Room left around the map for the column letters and row numbers. */
const MARGIN = 30

/** The camera of the reconstruction, as a transform of the map (the whole map without one). */
const cameraStyle = computed(() => {
  const camera = props.still?.camera
  if (!camera) return { transform: 'scale(1) translate(0px, 0px)' }
  return {
    transform: `scale(${zones.length / camera.size}) translate(${-camera.col * CELL}px, ${-camera.row * CELL}px)`,
  }
})

/**
 * The cell the player points at, under the mouse or under a drag: its whole
 * row and column light up, and its letter and number.
 */
const mouseCell = ref<Cell | null>(null)
const pointed = computed(() => (props.still ? null : (props.hoverCell ?? mouseCell.value)))

const ground = groundLabels(zones, FURNITURE)
const nameOf = (id: string) => PEOPLE.find((person) => person.id === id)!.name
const cellLabels = computed(() => tooltips(ground, props.placements, nameOf))
</script>

<template>
  <svg
    :viewBox="`${-MARGIN} ${-MARGIN} ${size + 2 * MARGIN} ${size + 2 * MARGIN}`"
    class="office-map"
    role="img"
    aria-label="Plan des bureaux de Marmelab"
  >
    <FloorPatterns />
    <clipPath id="map-area">
      <rect :width="size" :height="size" />
    </clipPath>
    <g clip-path="url(#map-area)">
      <g class="camera" :style="cameraStyle">
        <MapPlan :show-blocked="showBlocked" />

        <template v-if="still">
          <PeopleLayer :placements="still.positions" :effects="still.effects" />
          <ReconstructionLayer
            :positions="still.positions"
            :lines="still.lines"
            :effects="still.effects"
            :camera="still.camera ?? { row: 0, col: 0, size: zones.length }"
            :map-size="zones.length"
          />
        </template>
        <template v-else>
          <g v-if="pointed" class="crosshair" aria-hidden="true">
            <rect :y="pointed.row * CELL" :width="size" :height="CELL" />
            <rect :x="pointed.col * CELL" :width="CELL" :height="size" />
          </g>
          <NotesLayer :notes="notes" :placements="placements" :selected="selected" />
          <PeopleLayer :placements="placements" />

          <CellLayer
            :in-room="inRoom"
            :placeable="placeable"
            :labels="cellLabels"
            :crosses="crosses"
            :hover-cell="hoverCell"
            :selected-cell="selectedCell"
            :effect="effect"
            @click="emit('cellClick', $event)"
            @press="(cell, event) => emit('cellPress', cell, event)"
            @point="mouseCell = $event"
          />
        </template>
      </g>
    </g>

    <rect x="-3" y="-3" :width="size + 6" :height="size + 6" class="frame" />
    <MapCoordinates :cells="zones.length" :margin="MARGIN" :zoomed="!!still?.camera" :pointed="pointed" />
  </svg>
</template>

<style scoped>
/* The reconstruction's zooms (ZOOM_MS in lib/reconstruction.ts); a cut with reduced motion. */
.camera {
  transform-origin: 0 0;
  transition: transform 1.2s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .camera {
    transition: none;
  }
}
.crosshair rect {
  fill: rgb(242 196 24 / 28%);
  stroke: rgb(242 196 24 / 70%);
  stroke-width: 2;
}
.frame {
  fill: none;
  stroke: var(--color-blood-dark);
  stroke-width: 6;
}
</style>
