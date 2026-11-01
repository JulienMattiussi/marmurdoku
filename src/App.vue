<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BloodDrip from '@/components/BloodDrip.vue'
import CastPanel from '@/components/CastPanel.vue'
import CrossIcon from '@/components/CrossIcon.vue'
import SavesDialog from '@/components/SavesDialog.vue'
import OfficeMap from '@/components/OfficeMap.vue'
import VerdictOverlay from '@/components/VerdictOverlay.vue'
import { useGame } from '@/composables/useGame'
import { useDrag } from '@/composables/useDrag'
import { useReconstruction } from '@/composables/useReconstruction'
import { useSaves } from '@/composables/useSaves'
import { avatarUrl } from '@/data/people'
import { RECONSTRUCTION } from '@/data/reconstruction'
import { CROSS, emptyGame } from '@/lib/game'
import { timeline } from '@/lib/reconstruction'
import type { Save } from '@/lib/saves'
import type { Cell } from '@/lib/grid'
import { puzzleStatus } from '@/lib/solver'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

/** Debug mode (?debug in the URL): starts on the solution, hatches the cells nobody can use. */
const debug = new URLSearchParams(location.search).has('debug')
if (debug && puzzleStatus(PUZZLE, SOLUTION_PLACEMENTS) !== 'ok') {
  console.warn('La solution ne respecte pas tous les indices')
}

const game = useGame(
  PUZZLE,
  debug ? { ...emptyGame(), placements: { ...SOLUTION_PLACEMENTS } } : emptyGame(),
)
const drag = useDrag(game.drop)

const reconstruction = useReconstruction(() =>
  timeline(RECONSTRUCTION, game.state.value.placements, PUZZLE.board.size),
)
/**
 * Any new verdict puts the reconstruction away: a closed case starts on the
 * invitation to watch it, and a save loaded after it gives the map back.
 */
watch(game.verdict, () => reconstruction.reset())

const saves = useSaves()
const showSaves = ref(false)
const loadSave = (save: Save) => {
  game.load(save.state)
  showSaves.value = false
}

const selectedCell = computed(() =>
  game.selected.value ? (game.state.value.placements[game.selected.value] ?? null) : null,
)

/** A dragged suspect's card stays pressed during the drag, rather than the cross. */
const activeCard = computed(() => drag.dragged.value?.item ?? game.selected.value ?? CROSS)

const onCellClick = (cell: Cell) => {
  if (!drag.wasDragging()) game.click(cell)
}
const onCellPress = (cell: Cell, event: PointerEvent) => {
  const occupant = game.occupantOf(cell)
  if (occupant && !game.over.value) drag.press(occupant, event)
}
const onSelect = (person: string) => {
  if (!drag.wasDragging()) game.select(person)
}
const onPress = (item: string, event: PointerEvent) => {
  if (!game.over.value) drag.press(item, event)
}
const onCross = () => {
  if (!drag.wasDragging()) game.deselect()
}
</script>

<template>
  <!-- Large screens: the map alone on the right, as tall as the window; the rest on the left. -->
  <main class="flex flex-col gap-6 p-4 select-none lg:h-dvh lg:flex-row-reverse">
    <div class="relative lg:h-full lg:max-w-[50%] lg:shrink-0">
      <OfficeMap
        class="h-auto w-full lg:h-full lg:w-auto lg:max-w-full"
        :placements="game.state.value.placements"
        :crosses="game.state.value.crosses"
        :notes="game.state.value.notes"
        :selected="game.selected.value"
        :effect="game.effect.value"
        :hover-cell="drag.hoverCell.value"
        :selected-cell="selectedCell"
        :show-blocked="debug"
        :still="reconstruction.frame.value"
        @cell-click="onCellClick"
        @cell-press="onCellPress"
      />
      <template v-if="reconstruction.stage.value === 'playing'">
        <!-- A click anywhere on the map moves on to the next still. -->
        <button
          type="button"
          class="absolute inset-0 cursor-pointer"
          aria-label="Image suivante de la reconstitution"
          @click="reconstruction.next"
        />
        <button
          type="button"
          class="bg-ink/85 text-tape hover:bg-blood hover:text-bone absolute top-2 right-2 rounded-sm px-3 py-1 text-sm font-bold tracking-widest uppercase shadow-lg"
          @click="reconstruction.skip"
        >
          Passer ⏭
        </button>
      </template>
      <VerdictOverlay
        v-else-if="game.verdict.value"
        :verdict="game.verdict.value"
        :broken="game.broken.value"
        :stage="reconstruction.stage.value"
        @ok="game.dismiss"
        @watch="reconstruction.play"
      />
    </div>
    <div class="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
      <header class="short:gap-2 flex flex-col gap-3">
        <div class="crime-tape short:hidden -mx-4 -mt-4 -rotate-1 py-1.5 shadow-lg lg:-mt-2">
          <p
            class="crime-tape__text mx-auto w-fit px-3 text-sm font-bold tracking-[0.3em] uppercase"
          >
            Scène de crime · Ne pas franchir · Scène de crime
          </p>
        </div>
        <div class="flex flex-wrap items-start gap-x-6 gap-y-2">
          <div class="w-fit shrink-0">
            <h1
              class="font-horror text-blood-bright short:text-5xl text-6xl leading-none drop-shadow-[0_3px_0_#000]"
            >
              Marmerdoku
            </h1>
            <BloodDrip class="text-blood-bright short:h-5 -mt-1 h-7 w-full" />
          </div>
          <p class="short:text-sm min-w-0 flex-1 basis-64 text-base leading-snug">
            <span class="text-tape">Meurtre chez Marmelab.</span>
            Quelqu’un a été retrouvé sans vie dans les bureaux. Place chaque suspect, un par ligne
            et par colonne, et démasque le coupable.
          </p>
        </div>
      </header>
      <CastPanel
        :active="activeCard"
        :placements="game.state.value.placements"
        :notes="game.state.value.notes"
        :mode="game.mode.value"
        :can-verify="game.everyonePlaced.value && !game.over.value"
        :can-undo="game.canUndo.value"
        :can-redo="game.canRedo.value"
        @select="onSelect"
        @press="onPress"
        @verify="game.verify"
        @mode="game.mode.value = $event"
        @cross="onCross"
        @undo="game.undo"
        @redo="game.redo"
        @saves="showSaves = true"
      />
    </div>
    <SavesDialog
      v-if="showSaves"
      :saves="saves.saves.value"
      @save="saves.save($event, game.state.value)"
      @load="loadSave"
      @remove="saves.remove"
      @close="showSaves = false"
    />
    <template v-if="drag.dragged.value">
      <CrossIcon
        v-if="drag.dragged.value.item === CROSS"
        class="text-blood-bright pointer-events-none fixed z-10 size-12 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
        :style="{ left: `${drag.dragged.value.x}px`, top: `${drag.dragged.value.y}px` }"
      />
      <img
        v-else
        :src="avatarUrl(drag.dragged.value.item)"
        alt=""
        class="pointer-events-none fixed z-10 size-14 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
        :style="{ left: `${drag.dragged.value.x}px`, top: `${drag.dragged.value.y}px` }"
      />
    </template>
  </main>
</template>
