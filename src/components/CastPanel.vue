<script setup lang="ts">
import { ref } from 'vue'
import CastCard from '@/components/CastCard.vue'
import CrossIcon from '@/components/CrossIcon.vue'
import GameToolbar from '@/components/GameToolbar.vue'
import RulesDialog from '@/components/RulesDialog.vue'
import SuspectCard from '@/components/SuspectCard.vue'
import { GENERAL_CLUES } from '@/data/clues'
import { PEOPLE } from '@/data/people'
import { CROSS, type Mode } from '@/lib/game'
import type { Cell } from '@/lib/grid'

/**
 * The cast to place on the map, next to it, each with their clues. A click
 * picks a person (one at a time); pressing and moving drags them to a cell.
 */
defineProps<{
  /** The pressed card: the picked or dragged suspect, or `CROSS`. */
  active: string
  placements: Record<string, Cell>
  /** Positions noted per suspect: their count shows on each card. */
  notes: Record<string, string[]>
  mode: Mode
  /** "Vérifier" stays greyed out until everyone is on the map. */
  canVerify: boolean
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  select: [person: string]
  press: [person: string, event: PointerEvent]
  verify: []
  mode: [mode: Mode]
  cross: []
  undo: []
  redo: []
  saves: []
}>()

const showRules = ref(false)
</script>

<template>
  <aside class="short:gap-2.5 flex flex-col gap-4 lg:min-h-0" aria-labelledby="cast-title">
    <section
      class="paper relative -rotate-[0.6deg] rounded-sm px-4 py-2"
      aria-label="Ce que l’on sait"
    >
      <div class="mb-1 flex items-center gap-3">
        <h2 class="text-sm font-bold tracking-widest uppercase">Rapport d’enquête</h2>
        <span class="stamp bg-paper">Confidentiel</span>
        <button
          type="button"
          class="bg-ink text-tape hover:bg-blood hover:text-bone ml-auto flex items-center gap-1.5 rounded-sm px-3 py-0.5 text-sm font-bold tracking-widest uppercase shadow-md transition-colors"
          @click="showRules = true"
        >
          <!-- Drawn rather than typed: the typewriter font sets "?" off-center in its circle. -->
          <svg viewBox="0 0 16 16" class="size-4 shrink-0" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7.25" stroke="currentColor" stroke-width="1.2" />
            <path
              d="M5.9 6.1a2.1 2.1 0 1 1 3 1.9c-.6.3-.9.7-.9 1.3v.4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle cx="8" cy="11.7" r="0.9" fill="currentColor" />
          </svg>
          Règles
        </button>
      </div>
      <ul class="grid gap-x-6 text-[13px] leading-snug sm:grid-cols-2">
        <li v-for="clue in GENERAL_CLUES" :key="clue.text">— {{ clue.text }}</li>
      </ul>
    </section>
    <div class="flex items-center gap-4">
      <h2
        id="cast-title"
        class="font-horror text-blood-bright short:text-2xl text-3xl leading-none"
      >
        Les suspects
      </h2>
      <GameToolbar
        :mode="mode"
        :can-verify="canVerify"
        :can-undo="canUndo"
        :can-redo="canRedo"
        @verify="emit('verify')"
        @mode="emit('mode', $event)"
        @undo="emit('undo')"
        @redo="emit('redo')"
        @saves="emit('saves')"
      />
    </div>
    <ul
      class="short:gap-1 grid grid-cols-2 gap-2 p-1 sm:grid-cols-3 lg:min-h-0 lg:overflow-y-auto scrollbar-blood"
    >
      <li v-for="person in PEOPLE" :key="person.id">
        <SuspectCard
          :person="person"
          :pressed="active === person.id"
          :cell="placements[person.id]"
          :notes="notes[person.id]?.length ?? 0"
          @pick="emit('select', person.id)"
          @press="emit('press', person.id, $event)"
        />
      </li>
      <!-- In the cast's free slot: the cross tool, pressed whenever nobody is picked or dragged. -->
      <li>
        <CastCard
          dark
          :pressed="active === CROSS"
          @pick="emit('cross')"
          @press="emit('press', CROSS, $event)"
        >
          <template #icon>
            <CrossIcon class="text-blood-bright size-9 shrink-0 p-1.5" />
          </template>
          <span class="text-sm font-bold">Croix</span>
          <span class="text-[11px] leading-tight opacity-80">Marque un emplacement vide</span>
        </CastCard>
      </li>
    </ul>
    <RulesDialog v-if="showRules" @close="showRules = false" />
  </aside>
</template>
