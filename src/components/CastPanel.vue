<script setup lang="ts">
import { CLUES, GENERAL_CLUES } from '@/data/clues'
import { avatarUrl, PEOPLE } from '@/data/people'
import { ref } from 'vue'
import RulesDialog from '@/components/RulesDialog.vue'
import { cellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'

/**
 * The cast to place on the map, next to it, each with their clues. A click
 * picks a person (one at a time); pressing and moving drags them to a cell.
 */
defineProps<{
  selected: string | null
  placements: Record<string, Cell>
  /** "Vérifier" stays greyed out until everyone is on the map. */
  canVerify: boolean
}>()

const emit = defineEmits<{
  select: [person: string]
  press: [person: string, event: PointerEvent]
  verify: []
}>()

const showRules = ref(false)
</script>

<template>
  <aside class="flex flex-col gap-4 lg:min-h-0" aria-labelledby="cast-title">
    <section
      class="paper relative -rotate-[0.6deg] rounded-sm px-4 py-2"
      aria-label="Ce que l’on sait"
    >
      <h2 class="text-sm font-bold tracking-widest uppercase">Rapport d’enquête</h2>
      <button
        type="button"
        class="border-ink/40 hover:border-blood hover:text-blood absolute right-3 bottom-2 rounded-sm border px-2 text-xs tracking-widest uppercase"
        @click="showRules = true"
      >
        Règles
      </button>
      <span class="stamp bg-paper absolute -top-2.5 right-4">Confidentiel</span>
      <ul class="grid gap-x-6 text-[13px] leading-snug sm:grid-cols-2">
        <li v-for="clue in GENERAL_CLUES" :key="clue.text">— {{ clue.text }}</li>
      </ul>
    </section>
    <div class="flex items-center gap-4">
      <h2 id="cast-title" class="font-horror text-blood-bright text-3xl leading-none">
        Les suspects
      </h2>
      <button
        type="button"
        class="bg-blood text-bone hover:bg-blood-bright rounded-sm px-4 py-1.5 font-bold tracking-widest uppercase shadow-lg transition-colors disabled:cursor-not-allowed disabled:bg-stone-600 disabled:text-stone-300 disabled:shadow-none"
        :disabled="!canVerify"
        @click="emit('verify')"
      >
        Vérifier
      </button>
    </div>
    <ul
      class="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 lg:min-h-0 lg:overflow-y-auto xl:grid-cols-3"
    >
      <li v-for="person in PEOPLE" :key="person.id">
        <button
          type="button"
          class="paper flex h-full w-full touch-none items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-transform hover:-rotate-1 focus-visible:outline-3 focus-visible:outline-tape"
          :class="{ 'ring-blood-bright -rotate-1 ring-4': selected === person.id }"
          :aria-pressed="selected === person.id"
          @click="emit('select', person.id)"
          @pointerdown="emit('press', person.id, $event)"
        >
          <img
            :src="avatarUrl(person.id)"
            alt=""
            draggable="false"
            class="size-11 shrink-0"
            :class="{ 'opacity-35 grayscale': placements[person.id] }"
          />
          <span class="flex min-w-0 flex-col leading-tight">
            <span class="truncate font-bold">
              {{ person.name }}
              <span
                v-if="placements[person.id]"
                class="bg-blood text-bone ml-1 inline-flex h-[1.35em] items-center rounded-sm px-1 pt-[0.15em] align-[0.1em] text-xs leading-none"
              >
                {{ cellName(placements[person.id]!) }}
              </span>
            </span>
            <span v-for="clue in CLUES[person.id]" :key="clue.text" class="text-xs opacity-80">
              {{ clue.text }}
            </span>
          </span>
        </button>
      </li>
    </ul>
    <RulesDialog v-if="showRules" @close="showRules = false" />
  </aside>
</template>
