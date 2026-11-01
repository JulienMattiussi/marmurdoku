<script setup lang="ts">
import { computed } from 'vue'
import { avatarUrl, PEOPLE } from '@/data/people'
import { CELL } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import type { PersonEffect } from '@/lib/reconstruction'

/**
 * Avatars on their cells, each wrapped in a white aura that follows its
 * outline (the avatars are cut out). Nobody stands out: not even the victim.
 * During the reconstruction they walk from cell to cell and take on effects.
 */
const props = defineProps<{
  placements: Record<string, Cell>
  /** Reconstruction only: how each person looks. */
  effects?: PersonEffect[]
}>()

const SIZE = 44

const people = computed(() =>
  PEOPLE.flatMap((person) => {
    const cell = props.placements[person.id]
    if (!cell) return []
    const x = cell.col * CELL + (CELL - SIZE) / 2
    const y = cell.row * CELL + (CELL - SIZE) / 2
    const looks = (props.effects ?? [])
      .filter((effect) => effect.person === person.id)
      .map(({ effect }) => `person--${effect}`)
    return [{ ...person, x, y, looks }]
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
  <g
    v-for="person in people"
    :key="person.id"
    class="person"
    :class="{ 'person--walking': effects }"
    :style="{ transform: `translate(${person.x}px, ${person.y}px)` }"
  >
    <ellipse
      v-if="person.looks.includes('person--fallen')"
      class="blood"
      :cx="SIZE / 2"
      :cy="SIZE / 2 + 10"
      rx="30"
      ry="13"
    />
    <g :class="person.looks">
      <image
        :href="avatarUrl(person.id)"
        :width="SIZE"
        :height="SIZE"
        filter="url(#aura)"
        :class="{ 'person__image--blur': person.looks.includes('person--blur') }"
      >
        <title>{{ person.name }}</title>
      </image>
      <!-- In the shower: the top of the head shows over the steamed-up rest. -->
      <image
        v-if="person.looks.includes('person--blur')"
        :href="avatarUrl(person.id)"
        :width="SIZE"
        :height="SIZE"
        filter="url(#aura)"
        class="person__head"
      />
    </g>
  </g>
</template>

<style scoped>
/* Walks during the reconstruction: one cell per still (STEP_MS in lib/reconstruction.ts). */
.person--walking {
  transition: transform 0.42s linear;
}
.person > g {
  transform-box: fill-box;
  transform-origin: center;
}
.person__image--blur {
  filter: url(#aura) blur(3px);
}
.person__head {
  clip-path: inset(0 0 62% 0);
}
/* Foosball: jerky, uneven jolts, out of step between the two players. */
.person--sway {
  animation: jolt 1.9s infinite;
}
.person--swayBack {
  animation: jolt 2.3s -0.8s infinite reverse;
}
.person--fallen {
  transform: rotate(90deg) translateY(6px);
  filter: grayscale(1);
  transition:
    transform 0.5s ease-in,
    filter 0.5s;
}
.blood {
  fill: var(--color-blood);
  opacity: 0.85;
  transform-box: fill-box;
  transform-origin: center;
  animation: spread 1.2s ease-out both;
}
@keyframes spread {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
/* Snaps from one spot to the next, then holds there for a moment of uneven length. */
@keyframes jolt {
  0%,
  9% {
    transform: translateX(-12px);
  }
  12%,
  20% {
    transform: translateX(10px);
  }
  23%,
  41% {
    transform: translateX(-4px);
  }
  44%,
  50% {
    transform: translateX(15px);
  }
  53%,
  58% {
    transform: translateX(-15px);
  }
  61%,
  79% {
    transform: translateX(6px);
  }
  82%,
  88% {
    transform: translateX(13px);
  }
  91%,
  100% {
    transform: translateX(-12px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .person--walking,
  .person--fallen {
    transition: none;
  }
  .person--sway,
  .person--swayBack,
  .blood {
    animation: none;
  }
}
</style>
