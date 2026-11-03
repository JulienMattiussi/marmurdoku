<script setup lang="ts">
import { computed } from 'vue'
import type { Facing, FurnitureKind, Tone } from '@/lib/furniture'

/**
 * Appliances, storage and props, drawn facing south (back against the north
 * side) in a width x height box (pixels); FurniturePiece turns them.
 */
const props = defineProps<{
  kind: FurnitureKind
  width: number
  height: number
  tone?: Tone
  /** Sides flush with the next piece, already turned to the sprite's frame. */
  joins?: Facing[]
}>()

const CAR_COLORS: Partial<Record<Tone, string>> = {
  blue: '#3f6fb5',
  grey: '#8e949e',
}
const carColor = computed(() => CAR_COLORS[props.tone ?? 'grey'] ?? CAR_COLORS.grey!)

const SPINE_WIDTHS = [5, 6, 4, 7, 5, 6, 5, 4]
const SPINE_DEPTHS = [15, 12, 17, 13, 16, 14]
const SPINE_COLORS = ['#b8433a', '#2e6da4', '#e1a32a', '#3d8b5a', '#7d4f9e', '#e6ded0']

/** Pointed leaf of the given length and half width, growing from the origin toward -y. */
const leafPath = (length: number, half: number) =>
  `M0 0C${half} ${-length * 0.35} ${half * 0.6} ${-length * 0.8} 0 ${-length}` +
  `C${-half * 0.6} ${-length * 0.8} ${-half} ${-length * 0.35} 0 0Z`

/**
 * Potted plant seen from above: an outer ring of dark leaves, a lighter inner
 * one, both short enough to leave the rim of the pot showing.
 */
const PLANT_LEAVES = [
  ...[0, 47, 92, 138, 181, 226, 272, 317].map((angle, i) => ({
    angle,
    d: leafPath(i % 2 ? 12.5 : 14, 5),
    fill: i % 2 ? '#2f7a3a' : '#3a8a44',
  })),
  ...[22, 82, 145, 205, 262, 330].map((angle, i) => ({
    angle,
    d: leafPath(i % 2 ? 8 : 9, 3.5),
    fill: i % 2 ? '#5fae55' : '#6dbd5f',
  })),
].map((leaf, key) => ({ ...leaf, key }))

/** Leafy clumps of a flower bed: seven leaves in a rosette. */
const CLUMP_LEAVES = [0, 51, 103, 154, 206, 257, 309].map((angle, i) => ({
  angle,
  d: leafPath(i % 2 ? 9 : 11, 4),
}))
const CLUMP_GREENS = ['#2f7a3a', '#3f8f46', '#57a84e', '#6dbd5f']

const joined = (side: Facing) => !!props.joins?.includes(side)

/**
 * Inset of each side of a staircase or landing: the dark frame (outer) and the
 * wooden floor inside it (inner). A joined side has neither, so two pieces
 * meet without a seam.
 */
const frame = computed(() => {
  const outer = (side: Facing) => (joined(side) ? 0 : 3)
  const inner = (side: Facing) => (joined(side) ? 0 : 8)
  return {
    x: outer('west'),
    y: outer('north'),
    w: props.width - outer('west') - outer('east'),
    h: props.height - outer('north') - outer('south'),
    ix: inner('west'),
    iy: inner('north'),
    iw: props.width - inner('west') - inner('east'),
    ih: props.height - inner('north') - inner('south'),
  }
})

/** Frame of the stairs and landings: pale, so the Communs' name outweighs them. */
const STAIR_FRAME = '#a8825c'

/** Treads of a flight of stairs, about 7px deep whatever its length. */
const steps = computed(() => Math.max(3, Math.round(frame.value.ih / 7.2)))
const stepPitch = computed(() => frame.value.ih / steps.value)

/** Inner corners where two joined sides meet: the frame turns there. */
const cornerPosts = computed(() =>
  (
    [
      ['north', 'east', props.width - 8, 3],
      ['east', 'south', props.width - 8, props.height - 8],
      ['south', 'west', 3, props.height - 8],
      ['west', 'north', 3, 3],
    ] as const
  )
    .filter(([a, b]) => joined(a) && joined(b))
    .map(([a, b, x, y]) => ({ key: a + b, x, y })),
)

/** Book spines in a row against the back of a shelf. */
const spines = computed(() => {
  const books = []
  for (let at = 0, i = 0; at + SPINE_WIDTHS[i % SPINE_WIDTHS.length]! <= props.width - 10; i++) {
    const size = SPINE_WIDTHS[i % SPINE_WIDTHS.length]!
    books.push({
      x: 5 + at,
      y: 5,
      w: size,
      h: SPINE_DEPTHS[i % SPINE_DEPTHS.length]!,
      fill: SPINE_COLORS[(i * 7) % SPINE_COLORS.length]!,
      key: i,
    })
    at += size + 1
  }
  return books
})
</script>

<template>
  <g v-if="kind === 'shelf'" filter="url(#drop)">
    <rect x="2" y="2" :width="width - 4" :height="height - 4" rx="2" fill="#7d5431" />
    <rect x="4" y="4" :width="width - 8" :height="height - 8" rx="1" fill="#a87547" />
    <rect
      v-for="b in spines"
      :key="b.key"
      :x="b.x"
      :y="b.y"
      :width="b.w"
      :height="b.h"
      rx="0.8"
      :fill="b.fill"
    />
  </g>

  <!-- Keyboard against the north side, keys toward the player. -->
  <g v-else-if="kind === 'synth'" filter="url(#drop)">
    <rect x="3" y="8" :width="width - 6" height="30" rx="3" fill="#2b2f38" />
    <circle v-for="i in 4" :key="`k${i}`" :cx="6 + i * 8" cy="14" r="2.2" fill="#e1a32a" />
    <rect :x="width - 30" y="11" width="22" height="6" rx="1" fill="#7fd3c4" />
    <rect x="7" y="20" :width="width - 14" height="15" fill="#fbfbfa" />
    <path
      v-for="i in Math.floor((width - 14) / 6) - 1"
      :key="`w${i}`"
      :d="`M${7 + i * 6} 20V35`"
      stroke="#c9ced3"
    />
    <template v-for="i in Math.floor((width - 14) / 6) - 1" :key="`b${i}`">
      <rect
        v-if="i % 7 !== 3 && i % 7 !== 0"
        :x="5.5 + i * 6"
        y="20"
        width="3"
        height="9"
        fill="#2b2f38"
      />
    </template>
  </g>

  <!-- Seen from above, front to the south: body, windscreens, roof, mirrors, lights. -->
  <g v-else-if="kind === 'car'" filter="url(#drop)">
    <rect :x="width * 0.2 - 3" :y="height * 0.68" width="3" height="5" rx="1" fill="#2f3542" />
    <rect :x="width * 0.8" :y="height * 0.68" width="3" height="5" rx="1" fill="#2f3542" />
    <rect
      :x="width * 0.2"
      y="4"
      :width="width * 0.6"
      :height="height - 8"
      rx="14"
      :fill="carColor"
    />
    <rect
      :x="width * 0.26"
      :y="height * 0.22"
      :width="width * 0.48"
      :height="height * 0.14"
      rx="4"
      fill="#3b4250"
    />
    <rect
      :x="width * 0.26"
      :y="height * 0.6"
      :width="width * 0.48"
      :height="height * 0.16"
      rx="4"
      fill="#3b4250"
    />
    <rect
      :x="width * 0.28"
      :y="height * 0.37"
      :width="width * 0.44"
      :height="height * 0.22"
      rx="4"
      fill="rgb(255 255 255 / 18%)"
    />
    <rect :x="width * 0.25" :y="height - 9" width="8" height="4" rx="1.5" fill="#fff4c2" />
    <rect :x="width * 0.75 - 8" :y="height - 9" width="8" height="4" rx="1.5" fill="#fff4c2" />
    <rect :x="width * 0.25" y="5" width="7" height="3" rx="1" fill="#e04848" />
    <rect :x="width * 0.75 - 7" y="5" width="7" height="3" rx="1" fill="#e04848" />
  </g>

  <!--
    Letter boxes in slight perspective: the top of the block against the wall,
    then its front face leaning toward the viewer, three doors with their slot
    and name tag, a letter sticking out of the middle one.
  -->
  <g v-else-if="kind === 'mailbox'" filter="url(#drop)">
    <rect x="5" y="4" width="38" height="12" rx="1.5" fill="#3a566f" />
    <path d="M5 16H43L45 40H3Z" fill="#4a6b8a" />
    <path d="M17.7 16L17 40M30.3 16L31 40" stroke="#3a566f" stroke-width="1.5" />
    <g v-for="i in 3" :key="i" :transform="`translate(${5.5 + (i - 1) * 12.7} 0)`">
      <rect x="1.5" y="20" width="8.5" height="2" rx="0.5" fill="#1f2d3a" />
      <template v-if="i === 2">
        <rect
          x="3"
          y="21"
          width="6"
          height="6"
          fill="#ffffff"
          stroke="#b9b0a2"
          stroke-width="0.6"
        />
        <rect x="6.3" y="23.8" width="2" height="2.2" fill="#e1252f" />
      </template>
      <rect x="2.5" y="30" width="6.5" height="3" fill="#f5f0e8" />
      <circle cx="9" cy="35" r="0.9" fill="#d9a521" />
    </g>
  </g>

  <g v-else-if="kind === 'printer'" filter="url(#drop)">
    <rect x="6" y="10" width="36" height="28" rx="3" fill="#d9dde3" stroke="#a9b0ba" />
    <rect x="12" y="6" width="24" height="8" rx="1" fill="#fff" stroke="#c4c9d0" />
    <rect x="12" y="26" width="24" height="5" rx="1" fill="#7d8592" />
  </g>

  <!-- Planter box of soil, packed with leafy clumps. -->
  <g v-else-if="kind === 'flowerBed'" filter="url(#drop)">
    <rect x="2" y="8" :width="width - 4" height="32" rx="3" fill="#8a8f96" />
    <rect x="6" y="12" :width="width - 12" height="24" rx="2" fill="#5a3d26" />
    <g
      v-for="i in Math.floor((width - 16) / 8)"
      :key="i"
      :transform="`translate(${i * 8 + 4} ${[19, 29, 24][i % 3]}) rotate(${i * 37})`"
    >
      <path
        v-for="(leaf, j) in CLUMP_LEAVES"
        :key="leaf.angle"
        :d="leaf.d"
        :transform="`rotate(${leaf.angle})`"
        :fill="CLUMP_GREENS[(i + j) % CLUMP_GREENS.length]"
      />
    </g>
  </g>

  <g v-else-if="kind === 'plant'" filter="url(#drop)">
    <circle cx="24" cy="24" r="18" fill="#b4643a" />
    <circle cx="24" cy="24" r="18" fill="none" stroke="#8a4526" stroke-width="1.5" />
    <circle cx="24" cy="24" r="15" fill="#5a3d26" />
    <g transform="translate(24 24)">
      <g v-for="leaf in PLANT_LEAVES" :key="leaf.key" :transform="`rotate(${leaf.angle})`">
        <path :d="leaf.d" :fill="leaf.fill" />
        <path d="M0 -2V-10" stroke="rgb(255 255 255 / 25%)" stroke-width="0.8" />
      </g>
    </g>
  </g>

  <g v-else-if="kind === 'sink'" filter="url(#drop)">
    <rect x="8" y="6" width="32" height="30" rx="8" fill="#fbfbfa" stroke="#c9ced3" />
    <ellipse cx="24" cy="23" rx="10" ry="8" fill="#cfe4ee" />
    <rect x="22" y="8" width="4" height="8" rx="1" fill="#9aa7b0" />
  </g>

  <g v-else-if="kind === 'extinguisher'" filter="url(#drop)">
    <rect x="17" y="12" width="14" height="28" rx="6" fill="#d8322f" />
    <rect x="20" y="7" width="8" height="7" rx="2" fill="#2f2f2f" />
    <path d="M28 10Q36 10 34 20" stroke="#2f2f2f" stroke-width="2.5" fill="none" />
  </g>

  <!-- Seen from above, front wheel to the south: tyres, frame, handlebar, saddle. -->
  <g v-else-if="kind === 'bike'" filter="url(#drop)">
    <rect x="21.5" y="2" width="5" height="17" rx="2.5" fill="#2f3542" />
    <rect x="21.5" y="29" width="5" height="17" rx="2.5" fill="#2f3542" />
    <path d="M24 12V34" stroke="#d64545" stroke-width="3.5" stroke-linecap="round" />
    <path
      d="M13 32Q24 28 35 32"
      stroke="#4b525c"
      stroke-width="2.5"
      fill="none"
      stroke-linecap="round"
    />
    <rect x="11" y="30" width="4" height="4" rx="1" fill="#2f3542" />
    <rect x="33" y="30" width="4" height="4" rx="1" fill="#2f3542" />
    <ellipse cx="24" cy="15" rx="3.5" ry="5" fill="#2f3542" />
  </g>

  <!-- About twice as long as wide; rods cross the short side, handles stick out on both. -->
  <g v-else-if="kind === 'foosball'" filter="url(#drop)">
    <rect x="12" y="5" :width="width - 24" :height="height - 10" rx="3" fill="#d9772f" />
    <rect x="16" y="9" :width="width - 32" :height="height - 18" fill="#3f9a4a" />
    <path :d="`M${width / 2} 9V${height - 9}`" stroke="#e8f3e8" stroke-width="1.5" />
    <circle
      :cx="width / 2"
      :cy="height / 2"
      r="4"
      fill="none"
      stroke="#e8f3e8"
      stroke-width="1.2"
    />
    <g v-for="i in 6" :key="i">
      <path
        :d="`M${16 + (i * (width - 32)) / 7} 1V${height - 1}`"
        stroke="#b9c0c8"
        stroke-width="2"
      />
      <rect
        :x="16 + (i * (width - 32)) / 7 - 2.5"
        :y="i % 2 ? height / 2 - 9 : height / 2 + 3"
        width="5"
        height="6"
        rx="1"
        :fill="i <= 3 ? '#d64545' : '#2e6da4'"
      />
    </g>
  </g>

  <!-- Flat screen on its cabinet, with the glow of the picture spreading toward the viewers. -->
  <g v-else-if="kind === 'tv'">
    <defs>
      <linearGradient id="tv-glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8fd3ff" stop-opacity="0.75" />
        <stop offset="1" stop-color="#8fd3ff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path :d="`M10 22H${width - 10}L${width - 2} 46H2Z`" fill="url(#tv-glow)" />
    <rect x="3" y="3" :width="width - 6" height="14" rx="2" fill="#7b5231" filter="url(#drop)" />
    <rect x="7" y="11" :width="width - 14" height="11" rx="2" fill="#1d2129" />
    <rect x="9" y="13" :width="width - 18" height="7" rx="1" fill="#3c8fd6" />
    <rect :x="width / 2 - 5" y="6" width="10" height="5" rx="1" fill="#1d2129" />
  </g>

  <!-- Seen from above, door to the south: brushed top, cooling grille at the back, door edge and handles. -->
  <g v-else-if="kind === 'fridge'" filter="url(#drop)">
    <defs>
      <linearGradient id="fridge-top" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f6f8" />
        <stop offset="1" stop-color="#d5dbe1" />
      </linearGradient>
    </defs>
    <rect x="5" y="3" width="38" height="38" rx="3" fill="url(#fridge-top)" stroke="#a9b3bd" />
    <path d="M10 8H38M10 11H38M10 14H38" stroke="#b9c2cb" stroke-width="1.2" />
    <rect x="5" y="38" width="38" height="5" rx="1.5" fill="#c3cbd3" stroke="#a9b3bd" />
    <rect x="11" y="43" width="10" height="3" rx="1.5" fill="#7d8792" />
    <rect x="27" y="43" width="10" height="3" rx="1.5" fill="#7d8792" />
  </g>

  <!-- Treads in two alternating tones, so joined flights read as one; chevrons give the way. -->
  <g v-else-if="kind === 'stairs'">
    <rect :x="frame.x" :y="frame.y" :width="frame.w" :height="frame.h" :fill="STAIR_FRAME" />
    <g v-for="i in steps" :key="i">
      <rect
        :x="frame.ix"
        :y="frame.iy + (i - 1) * stepPitch"
        :width="frame.iw"
        :height="stepPitch"
        :fill="i % 2 ? '#c79f6f' : '#b98f5f'"
      />
      <rect
        :x="frame.ix"
        :y="frame.iy + i * stepPitch - 1"
        :width="frame.iw"
        height="1"
        fill="rgb(0 0 0 / 18%)"
      />
    </g>
    <path
      :d="`M${width / 2 - 6} ${height / 2 - 5}l6 6l6 -6M${width / 2 - 6} ${height / 2 + 3}l6 6l6 -6`"
      stroke="#fffaf0"
      stroke-width="2.5"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.85"
    />
  </g>

  <!-- Flat platform where a staircase turns. -->
  <g v-else-if="kind === 'landing'">
    <rect :x="frame.x" :y="frame.y" :width="frame.w" :height="frame.h" :fill="STAIR_FRAME" />
    <rect :x="frame.ix" :y="frame.iy" :width="frame.iw" :height="frame.ih" fill="#c79f6f" />
    <rect
      v-for="post in cornerPosts"
      :key="post.key"
      :x="post.x"
      :y="post.y"
      width="5"
      height="5"
      :fill="STAIR_FRAME"
    />
  </g>
</template>
