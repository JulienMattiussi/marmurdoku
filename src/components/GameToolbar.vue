<script setup lang="ts">
import type { Mode } from '@/lib/game'

/** Next to "Les suspects": verify, place or note, undo and redo, saves. */
defineProps<{ mode: Mode; canVerify: boolean; canUndo: boolean; canRedo: boolean }>()

const emit = defineEmits<{
  verify: []
  mode: [mode: Mode]
  undo: []
  redo: []
  saves: []
}>()

const MODES: { value: Mode; label: string; title: string }[] = [
  { value: 'place', label: 'Placer', title: 'Un clic place le suspect sélectionné' },
  {
    value: 'note',
    label: 'Noter',
    title: 'Un clic note une position possible du suspect sélectionné',
  },
]
</script>

<template>
  <div class="flex flex-1 flex-wrap items-center gap-2">
    <button
      type="button"
      class="bg-blood text-bone hover:bg-blood-bright flex h-8 items-center rounded-sm px-4 text-sm leading-none font-bold tracking-widest uppercase shadow-lg transition-colors disabled:cursor-not-allowed disabled:bg-stone-600 disabled:text-stone-300 disabled:shadow-none"
      :disabled="!canVerify"
      @click="emit('verify')"
    >
      Vérifier
    </button>
    <div
      class="border-bone/30 flex h-8 overflow-hidden rounded-sm border"
      role="group"
      aria-label="Mode"
    >
      <button
        v-for="option in MODES"
        :key="option.value"
        type="button"
        class="flex items-center gap-1.5 px-3 text-sm leading-none font-bold tracking-wider uppercase transition-colors"
        :class="mode === option.value ? 'bg-tape text-night' : 'text-bone hover:bg-white/10'"
        :aria-pressed="mode === option.value"
        :title="option.title"
        @click="emit('mode', option.value)"
      >
        <!-- Pencil: solid to place, dotted outline to note. -->
        <svg viewBox="0 0 16 16" class="size-4 shrink-0" aria-hidden="true">
          <path
            d="M11.5 1.5l3 3-8.5 8.5-4 1 1-4z"
            :fill="option.value === 'place' ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
            :stroke-dasharray="option.value === 'note' ? '2 1.6' : undefined"
          />
        </svg>
        {{ option.label }}
      </button>
    </div>
    <div class="ml-auto flex items-center gap-2">
      <div class="flex gap-1">
        <button
          type="button"
          class="text-bone flex h-8 items-center rounded-sm px-2 text-lg leading-none hover:bg-white/10 disabled:opacity-30"
          :disabled="!canUndo"
          aria-label="Annuler"
          title="Annuler (Ctrl+Z)"
          @click="emit('undo')"
        >
          ↶
        </button>
        <button
          type="button"
          class="text-bone flex h-8 items-center rounded-sm px-2 text-lg leading-none hover:bg-white/10 disabled:opacity-30"
          :disabled="!canRedo"
          aria-label="Refaire"
          title="Refaire (Ctrl+Y)"
          @click="emit('redo')"
        >
          ↷
        </button>
      </div>
      <button
        type="button"
        class="border-bone/30 text-bone flex h-8 items-center rounded-sm border px-3 text-sm leading-none font-bold tracking-wider uppercase transition-colors hover:bg-white/10"
        @click="emit('saves')"
      >
        Sauvegardes
      </button>
    </div>
  </div>
</template>
