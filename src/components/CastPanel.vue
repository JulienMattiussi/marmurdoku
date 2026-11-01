<script setup lang="ts">
import { CLUES, GENERAL_CLUES } from '@/data/clues'
import { avatarUrl, colorOf, inkOn, PEOPLE } from '@/data/people'
import { ref } from 'vue'
import CrossIcon from '@/components/CrossIcon.vue'
import GameToolbar from '@/components/GameToolbar.vue'
import RulesDialog from '@/components/RulesDialog.vue'
import { cellName } from '@/lib/geometry'
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
        <button
          type="button"
          class="paper short:py-0.5 flex h-full w-full cursor-grab touch-none items-center gap-2 rounded-sm px-2 py-1 text-left transition-transform hover:-rotate-1 focus-visible:outline-3 focus-visible:outline-tape"
          :class="{ 'ring-blood-bright -rotate-1 ring-4': active === person.id }"
          :aria-pressed="active === person.id"
          @click="emit('select', person.id)"
          @pointerdown="emit('press', person.id, $event)"
        >
          <img
            :src="avatarUrl(person.id)"
            alt=""
            draggable="false"
            class="size-9 shrink-0"
            :class="{ 'opacity-35 grayscale': placements[person.id] }"
          />
          <span class="short:gap-0.5 flex min-w-0 flex-col gap-1 leading-tight">
            <span class="truncate text-sm font-bold">
              <!-- The name on the suspect's color: the legend of their notes on the map. -->
              <span
                class="inline-flex h-[1.45em] items-center rounded-full px-2 pt-[0.12em] leading-none"
                :class="{ 'opacity-50 grayscale': placements[person.id] }"
                :style="{ backgroundColor: colorOf(person.id), color: inkOn(person.id) }"
                >{{ person.name }}</span
              >
              <span
                v-if="!placements[person.id] && notes[person.id]?.length"
                class="ml-1 text-xs font-normal"
                :class="notes[person.id]!.length === 1 ? 'text-blood font-bold' : 'opacity-70'"
                :title="notes[person.id]!.length === 1 ? 'Une seule position notée' : undefined"
              >
                · {{ notes[person.id]!.length }} note{{ notes[person.id]!.length > 1 ? 's' : '' }}
              </span>
              <span
                v-if="placements[person.id]"
                class="bg-blood text-bone ml-1 inline-flex h-[1.35em] items-center rounded-sm px-1 pt-[0.15em] align-[0.1em] text-xs leading-none"
              >
                {{ cellName(placements[person.id]!) }}
              </span>
            </span>
            <span
              v-for="clue in CLUES[person.id]"
              :key="clue.text"
              class="text-[11px] leading-tight opacity-80"
            >
              {{ clue.text }}
            </span>
          </span>
        </button>
      </li>
      <!-- In the cast's free slot: the cross tool, pressed whenever nobody is picked or dragged. -->
      <li>
        <button
          type="button"
          class="bg-ink text-paper short:py-0.5 flex h-full w-full cursor-grab touch-none items-center gap-2 rounded-sm px-2 py-1 text-left shadow-lg transition-transform hover:-rotate-1 focus-visible:outline-3 focus-visible:outline-tape"
          :class="{ 'ring-blood-bright -rotate-1 ring-4': active === CROSS }"
          :aria-pressed="active === CROSS"
          @click="emit('cross')"
          @pointerdown="emit('press', CROSS, $event)"
        >
          <CrossIcon class="text-blood-bright size-9 shrink-0 p-1.5" />
          <span class="short:gap-0.5 flex min-w-0 flex-col gap-1 leading-tight">
            <span class="text-sm font-bold">Croix</span>
            <span class="text-[11px] leading-tight opacity-80">Marque un emplacement vide</span>
          </span>
        </button>
      </li>
    </ul>
    <RulesDialog v-if="showRules" @close="showRules = false" />
  </aside>
</template>
