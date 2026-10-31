<script setup lang="ts">
import type { FurnitureKind } from '@/lib/furniture'

/** Seats, drawn facing south (backrest on top) in a width x height box. */
defineProps<{ kind: FurnitureKind; width: number; height: number }>()
</script>

<template>
  <g v-if="kind === 'chair'" filter="url(#drop)">
    <rect x="11" y="15" width="26" height="23" rx="6" fill="#5d6574" />
    <rect x="9" y="8" width="30" height="9" rx="4" fill="#3c424e" />
    <rect x="15" y="20" width="18" height="13" rx="4" fill="#6f7888" />
  </g>

  <g v-else-if="kind === 'stool'" filter="url(#drop)">
    <circle cx="24" cy="24" r="12" fill="#a63d55" />
    <circle cx="24" cy="24" r="7" fill="#c25570" />
  </g>

  <g v-else-if="kind === 'sofa'" filter="url(#drop)">
    <rect x="4" y="6" :width="width - 8" height="36" rx="9" fill="#7b3a5e" />
    <rect x="4" y="6" :width="width - 8" height="12" rx="6" fill="#652d4c" />
    <rect x="4" y="12" width="9" height="30" rx="4" fill="#652d4c" />
    <rect :x="width - 13" y="12" width="9" height="30" rx="4" fill="#652d4c" />
    <rect x="14" y="19" :width="width / 2 - 15" height="19" rx="4" fill="#94507a" />
    <rect :x="width / 2 + 1" y="19" :width="width / 2 - 15" height="19" rx="4" fill="#94507a" />
  </g>

  <!-- Headboard against the west side, pillow then duvet toward the east. -->
  <g v-else-if="kind === 'bed'" filter="url(#drop)">
    <rect x="3" y="5" :width="width - 6" height="38" rx="4" fill="#e9e4da" />
    <rect x="3" y="5" width="8" height="38" rx="3" fill="#7d5431" />
    <rect x="14" y="10" width="16" height="28" rx="6" fill="#ffffff" stroke="#d8d2c6" />
    <rect x="34" y="7" :width="width - 40" height="34" rx="4" fill="#6d8fc7" />
    <path :d="`M34 15H${width - 6}`" stroke="#8eaad6" stroke-width="3" />
  </g>

  <g v-else-if="kind === 'toilet'" filter="url(#drop)">
    <rect x="12" y="6" width="24" height="10" rx="3" fill="#f7f7f5" stroke="#c9ced3" />
    <ellipse cx="24" cy="29" rx="11" ry="13" fill="#fbfbfa" stroke="#c9ced3" />
    <ellipse cx="24" cy="30" rx="6" ry="8" fill="#d8e6ee" />
  </g>
</template>
