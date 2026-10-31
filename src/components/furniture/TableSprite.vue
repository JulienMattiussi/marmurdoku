<script setup lang="ts">
import { computed } from 'vue'
import type { Facing, FurnitureKind, Tone } from '@/lib/furniture'
import { CELL } from '@/lib/geometry'

/** Tables and floor coverings, drawn in a width x height box (pixels). */
/** Worktop pieces: plain, or with an appliance built in. */
const WORKTOPS = new Set<FurnitureKind>(['counter', 'kitchenSink', 'coffeeMaker', 'hob'])

const props = defineProps<{
  kind: FurnitureKind
  width: number
  height: number
  tone?: Tone
  /** Sides flush with the next piece, already turned to the sprite's frame. */
  joins?: Facing[]
  seated?: boolean[]
}>()

const RUG_TONES: Partial<Record<Tone, { fill: string; border: string; stitch: string }>> = {
  green: { fill: '#c8d07f', border: '#9aa456', stitch: '#e0e6a8' },
  grey: { fill: '#b7bcc4', border: '#8e949e', stitch: '#d3d7dd' },
}
const rug = computed(() => RUG_TONES[props.tone ?? 'green'] ?? RUG_TONES.green!)

/**
 * Desk top, inset from the cell edges except on joined sides, where it runs
 * to the edge so that two desks pushed together read as one. Only the free
 * sides get a border. Kitchen worktops are never inset: they stand against
 * the walls, and an L of them meets without a step.
 */
const top = computed(() => {
  const joined = (side: Facing) => !!props.joins?.includes(side)
  const inset = WORKTOPS.has(props.kind) ? 0 : 3
  const x0 = joined('west') ? 0 : inset
  const y0 = joined('north') ? 0 : inset
  const x1 = joined('east') ? props.width : props.width - inset
  const y1 = joined('south') ? props.height : props.height - inset
  const border = [
    joined('north') ? '' : `M${x0} ${y0}H${x1}`,
    joined('east') ? '' : `M${x1} ${y0}V${y1}`,
    joined('south') ? '' : `M${x0} ${y1}H${x1}`,
    joined('west') ? '' : `M${x0} ${y0}V${y1}`,
  ].join('')
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, border, rounded: !props.joins?.length }
})

/**
 * Monitors of a desk, centered on (cx, cy) and drawn for a user to the south
 * (flipped for one to the north). One per seated cell, against the edge
 * opposite to its user: islands two cells high seat people north and south, a
 * lone desk seats its user to the south and is turned by FurniturePiece. A
 * face-to-face desk has two back to back in the middle.
 */
const screens = computed(() => {
  const cols = props.width / CELL
  const rows = props.height / CELL
  if (props.kind === 'facingDesk') {
    // Two screens back to back in the middle, one for each side.
    return Array.from({ length: cols }, (_, col) => [
      { cx: col * CELL + CELL / 2, cy: props.height / 2 - 4, userNorth: true, key: `${col}n` },
      { cx: col * CELL + CELL / 2, cy: props.height / 2 + 4, userNorth: false, key: `${col}s` },
    ]).flat()
  }
  return Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const userNorth = rows === 2 && row === 0
    const cy = row * CELL + (userNorth ? 34 : 14)
    return {
      cx: col * CELL + CELL / 2,
      cy,
      userNorth,
      key: `${i}`,
      seated: props.seated?.[i] ?? true,
    }
  }).filter((screen) => screen.seated)
})
</script>

<template>
  <!-- facingDesk: two users face to face across it (north and south), screens back to back. -->
  <g v-if="kind === 'desk' || kind === 'plainDesk' || kind === 'facingDesk'" filter="url(#drop)">
    <defs>
      <linearGradient id="screen-glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8fd3ff" stop-opacity="0.6" />
        <stop offset="1" stop-color="#8fd3ff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect
      :x="top.x"
      :y="top.y"
      :width="top.w"
      :height="top.h"
      :rx="top.rounded ? 3 : 0"
      fill="#f7f4ef"
      :stroke="top.rounded ? '#d6cfc4' : 'none'"
    />
    <path v-if="!top.rounded" :d="top.border" stroke="#d6cfc4" fill="none" />
    <!-- Monitors like the TVs: dark frame, lit picture, stand behind, glow toward the user. -->
    <g
      v-for="s in kind === 'plainDesk' ? [] : screens"
      :key="s.key"
      :transform="`translate(${s.cx} ${s.cy}) scale(1 ${s.userNorth ? -1 : 1})`"
    >
      <path d="M-11 5H11L15 12H-15Z" fill="url(#screen-glow)" />
      <rect x="-4" y="-5" width="8" height="4" rx="1" fill="#1d2129" />
      <rect x="-13" y="-2" width="26" height="7" rx="2" fill="#1d2129" />
      <rect x="-11" y="-0.5" width="22" height="4" rx="1" fill="#3c8fd6" />
    </g>
  </g>

  <g v-else-if="kind === 'table'" filter="url(#drop)">
    <rect
      x="3"
      y="3"
      :width="width - 6"
      :height="height - 6"
      rx="6"
      fill="#f3efe8"
      stroke="#cdbfae"
      stroke-width="2"
    />
    <circle :cx="width / 2 - 30" :cy="height / 2" r="7" fill="#fff" stroke="#d9d2c6" />
    <circle :cx="width / 2 + 30" :cy="height / 2" r="7" fill="#fff" stroke="#d9d2c6" />
  </g>

  <!-- Worktop, built like a desk top so an L of joined pieces reads as one. -->
  <g v-else-if="WORKTOPS.has(kind)" filter="url(#drop)">
    <rect
      :x="top.x"
      :y="top.y"
      :width="top.w"
      :height="top.h"
      :rx="top.rounded ? 2 : 0"
      fill="#e6e0d6"
    />
    <path :d="top.border" stroke="#b9b0a2" stroke-width="1.5" fill="none" />
    <template v-if="kind === 'coffeeMaker'">
      <rect x="13" y="6" width="22" height="24" rx="4" fill="#2f3542" />
      <rect x="17" y="10" width="14" height="5" rx="1.5" fill="#7fd3c4" />
      <circle cx="24" cy="34" r="6" fill="#fbfbfa" stroke="#c9ced3" />
      <circle cx="24" cy="34" r="3.5" fill="#6b4226" />
    </template>
    <template v-if="kind === 'hob'">
      <rect x="6" y="6" width="36" height="34" rx="3" fill="#25292f" />
      <circle cx="16" cy="16" r="6" fill="none" stroke="#5a616b" stroke-width="2" />
      <circle cx="32" cy="16" r="5" fill="none" stroke="#5a616b" stroke-width="2" />
      <circle cx="16" cy="31" r="5" fill="none" stroke="#5a616b" stroke-width="2" />
      <circle cx="32" cy="31" r="6" fill="none" stroke="#e0603a" stroke-width="2" />
    </template>
    <template v-if="kind === 'kitchenSink'">
      <rect x="9" y="12" width="30" height="26" rx="5" fill="#c9d3da" stroke="#9aa7b0" />
      <rect x="12" y="15" width="24" height="20" rx="4" fill="#dde6ec" />
      <circle cx="24" cy="27" r="2" fill="#8a97a1" />
      <path d="M24 5V13" stroke="#8a97a1" stroke-width="3" stroke-linecap="round" />
    </template>
  </g>

  <!-- Light oak bar top with a rounded front edge, a couple of glasses on it. -->
  <g v-else-if="kind === 'bar'" filter="url(#drop)">
    <rect
      x="2"
      y="8"
      :width="width - 4"
      height="30"
      rx="6"
      fill="#e3c99f"
      stroke="#c2a273"
      stroke-width="1.5"
    />
    <rect x="2" y="32" :width="width - 4" height="6" rx="3" fill="#d4b588" />
    <path :d="`M8 16H${width - 8}M8 24H${width - 8}`" stroke="#d4b98e" stroke-width="1" />
    <circle cx="22" cy="20" r="3.5" fill="#f2fbff" stroke="#a9c7d6" />
    <circle :cx="width - 26" cy="22" r="3.5" fill="#f2fbff" stroke="#a9c7d6" />
  </g>

  <g v-else-if="kind === 'rug'">
    <rect
      x="4"
      y="4"
      :width="width - 8"
      :height="height - 8"
      rx="4"
      :fill="rug.fill"
      :stroke="rug.border"
      stroke-width="3"
    />
    <rect
      x="10"
      y="10"
      :width="width - 20"
      :height="height - 20"
      rx="2"
      fill="none"
      :stroke="rug.stitch"
      stroke-dasharray="4 4"
    />
  </g>

  <g v-else-if="kind === 'shower'">
    <rect x="2" y="2" :width="width - 4" :height="height - 4" rx="2" fill="#c9dde6" />
    <path
      v-for="i in Math.floor((width - 4) / 11)"
      :key="`v${i}`"
      :d="`M${2 + i * 11} 2V${height - 2}`"
      stroke="#b3cad5"
    />
    <path
      v-for="i in Math.floor((height - 4) / 11)"
      :key="`h${i}`"
      :d="`M2 ${2 + i * 11}H${width - 2}`"
      stroke="#b3cad5"
    />
    <rect :x="width / 2 - 8" :y="height / 2 - 2" width="16" height="4" rx="1" fill="#7f97a3" />
    <circle cx="12" cy="12" r="6" fill="#e9f1f5" stroke="#8aa3b1" stroke-width="1.5" />
    <path
      :d="`M${width / 2} ${height - 3}H${width - 3}`"
      stroke="#9fd0e6"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.9"
    />
  </g>
</template>
