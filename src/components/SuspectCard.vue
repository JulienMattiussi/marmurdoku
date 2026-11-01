<script setup lang="ts">
import CastCard from '@/components/CastCard.vue'
import { CLUES } from '@/data/clues'
import { avatarUrl, colorOf, inkOn, type Person } from '@/data/people'
import { cellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'

/**
 * A suspect's card: avatar, name on their color, clues. Once placed, the card
 * greys out and shows the cell; before, how many positions are noted.
 */
defineProps<{
  person: Person
  pressed: boolean
  cell?: Cell
  notes: number
}>()
const emit = defineEmits<{ pick: []; press: [event: PointerEvent] }>()
</script>

<template>
  <CastCard :pressed="pressed" @pick="emit('pick')" @press="emit('press', $event)">
    <template #icon>
      <img
        :src="avatarUrl(person.id)"
        alt=""
        draggable="false"
        class="size-9 shrink-0"
        :class="{ 'opacity-35 grayscale': cell }"
      />
    </template>
    <span class="truncate text-sm font-bold">
      <!-- The name on the suspect's color: the legend of their notes on the map. -->
      <span
        class="inline-flex h-[1.45em] items-center rounded-full px-2 pt-[0.12em] leading-none"
        :class="{ 'opacity-50 grayscale': cell }"
        :style="{ backgroundColor: colorOf(person.id), color: inkOn(person.id) }"
        >{{ person.name }}</span
      >
      <span
        v-if="!cell && notes"
        class="ml-1 text-xs font-normal"
        :class="notes === 1 ? 'text-blood font-bold' : 'opacity-70'"
        :title="notes === 1 ? 'Une seule position notée' : undefined"
      >
        · {{ notes }} note{{ notes > 1 ? 's' : '' }}
      </span>
      <span
        v-if="cell"
        class="bg-blood text-bone ml-1 inline-flex h-[1.35em] items-center rounded-sm px-1 pt-[0.15em] align-[0.1em] text-xs leading-none"
      >
        {{ cellName(cell) }}
      </span>
    </span>
    <span
      v-for="clue in CLUES[person.id]"
      :key="clue.text"
      class="text-[11px] leading-tight opacity-80"
    >
      {{ clue.text }}
    </span>
  </CastCard>
</template>
