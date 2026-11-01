<script setup lang="ts">
import CrossIcon from '@/components/CrossIcon.vue'
import { avatarUrl } from '@/data/people'
import { CROSS } from '@/lib/game'

/** What follows the pointer during a drag: the suspect's avatar, or the cross. */
defineProps<{ item: string; x: number; y: number }>()
</script>

<template>
  <CrossIcon
    v-if="item === CROSS"
    class="text-blood-bright pointer-events-none fixed z-10 size-12 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
    :style="{ left: `${x}px`, top: `${y}px` }"
  />
  <img
    v-else
    :src="avatarUrl(item)"
    alt=""
    class="pointer-events-none fixed z-10 size-14 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
    :style="{ left: `${x}px`, top: `${y}px` }"
  />
</template>
