<script setup lang="ts">
import { computed } from 'vue'
import { avatarUrl, PEOPLE } from '@/data/people'
import { CELL } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'

/**
 * Avatars on their cells, each wrapped in a white aura that follows its
 * outline (the avatars are cut out). Nobody stands out: not even the victim.
 */
const props = defineProps<{ placements: Record<string, Cell> }>()

const SIZE = 44

const people = computed(() =>
  PEOPLE.flatMap((person) => {
    const cell = props.placements[person.id]
    if (!cell) return []
    const x = cell.col * CELL + (CELL - SIZE) / 2
    const y = cell.row * CELL + (CELL - SIZE) / 2
    return [{ ...person, x, y }]
  }),
)
</script>

<template>
  <defs>
    <filter id="aura" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="grown" />
      <feFlood flood-color="#ffffff" />
      <feComposite in2="grown" operator="in" result="aura" />
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.35" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <image
    v-for="person in people"
    :key="person.id"
    :href="avatarUrl(person.id)"
    :x="person.x"
    :y="person.y"
    :width="SIZE"
    :height="SIZE"
    filter="url(#aura)"
  >
    <title>{{ person.name }}</title>
  </image>
</template>
