<script setup lang="ts">
import { computed } from 'vue'
import SeatSprite from '@/components/furniture/SeatSprite.vue'
import TableSprite from '@/components/furniture/TableSprite.vue'
import DecorSprite from '@/components/furniture/DecorSprite.vue'
import { FURNITURE_KINDS, spriteSides, type Facing, type Furniture } from '@/lib/furniture'
import { CELL } from '@/lib/geometry'

const props = defineProps<{
  piece: Furniture
  /** Desks only: which cells have a seat on their user's side (see seatedCells). */
  seated?: boolean[]
}>()

const SPRITES = { seat: SeatSprite, table: TableSprite, decor: DecorSprite }

const width = (props.piece.width ?? 1) * CELL
const height = (props.piece.height ?? 1) * CELL

/**
 * Sprites are drawn facing south, in a box whose sides are swapped for pieces
 * facing east or west; the turn then brings the box back onto the cells.
 */
const TURN: Record<Facing, string> = {
  south: '',
  north: `translate(${width} ${height}) rotate(180)`,
  west: `translate(${width} 0) rotate(90)`,
  east: `translate(0 ${height}) rotate(-90)`,
}
const sideways = props.piece.facing === 'east' || props.piece.facing === 'west'
const spriteWidth = sideways ? height : width
const spriteHeight = sideways ? width : height
const transform = computed(() => {
  const { row, col, facing } = props.piece
  return `translate(${col * CELL} ${row * CELL}) ${facing ? TURN[facing] : ''}`
})
const joins = spriteSides(props.piece.joins ?? [], props.piece.facing)
const sprite = computed(() => SPRITES[FURNITURE_KINDS[props.piece.kind].sprite])
</script>

<template>
  <g :transform="transform">
    <title>{{ FURNITURE_KINDS[piece.kind].label }}</title>
    <component
      :is="sprite"
      :kind="piece.kind"
      :width="spriteWidth"
      :height="spriteHeight"
      :tone="piece.tone"
      :joins="joins"
      :seated="seated"
    />
  </g>
</template>
