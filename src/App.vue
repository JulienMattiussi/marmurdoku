<script setup lang="ts">
import { computed, ref } from 'vue'
import BloodDrip from '@/components/BloodDrip.vue'
import CastPanel from '@/components/CastPanel.vue'
import OfficeMap from '@/components/OfficeMap.vue'
import { usePersonDrag } from '@/composables/usePersonDrag'
import { avatarUrl } from '@/data/people'
import { clickCell, dropPerson, emptyGame, toggleSelection, type GameState } from '@/lib/game'
import { cellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import { puzzleStatus } from '@/lib/solver'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

/** Debug mode (?debug in the URL): starts on the solution, hatches the cells nobody can use. */
const debug = new URLSearchParams(location.search).has('debug')
if (debug && puzzleStatus(PUZZLE, SOLUTION_PLACEMENTS) !== 'ok') {
  console.warn('La solution ne respecte pas tous les indices')
}

const game = ref<GameState>(
  debug ? { ...emptyGame(), placements: { ...SOLUTION_PLACEMENTS } } : emptyGame(),
)

const drag = usePersonDrag((person, cell) => (game.value = dropPerson(game.value, person, cell)))

const occupantOf = (cell: Cell) =>
  Object.keys(game.value.placements).find(
    (id) => cellName(game.value.placements[id]!) === cellName(cell),
  )

const selectedCell = computed(() =>
  game.value.selected ? (game.value.placements[game.value.selected] ?? null) : null,
)

const onCellClick = (cell: Cell) => {
  if (!drag.wasDragging()) game.value = clickCell(game.value, cell)
}
const onCellPress = (cell: Cell, event: PointerEvent) => {
  const occupant = occupantOf(cell)
  if (occupant) drag.press(occupant, event)
}
const onSelect = (person: string) => {
  if (!drag.wasDragging()) game.value = toggleSelection(game.value, person)
}
</script>

<template>
  <!-- Large screens: the map alone on the right, as tall as the window; the rest on the left. -->
  <main class="flex flex-col gap-6 p-4 select-none lg:h-dvh lg:flex-row-reverse">
    <OfficeMap
      class="h-auto w-full lg:h-full lg:w-auto lg:max-w-[50%] lg:shrink-0"
      :placements="game.placements"
      :crosses="game.crosses"
      :hover-cell="drag.hoverCell.value"
      :selected-cell="selectedCell"
      :show-blocked="debug"
      @cell-click="onCellClick"
      @cell-press="onCellPress"
    />
    <div class="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
      <header class="flex flex-col gap-3">
        <div class="crime-tape -mx-4 -mt-4 -rotate-1 py-1.5 shadow-lg lg:-mt-2">
          <p
            class="crime-tape__text mx-auto w-fit px-3 text-sm font-bold tracking-[0.3em] uppercase"
          >
            Scène de crime · Ne pas franchir · Scène de crime
          </p>
        </div>
        <div class="flex flex-wrap items-start gap-x-6 gap-y-2">
          <div class="w-fit shrink-0">
            <h1
              class="font-horror text-blood-bright text-6xl leading-none drop-shadow-[0_3px_0_#000]"
            >
              Marmerdoku
            </h1>
            <BloodDrip class="text-blood-bright -mt-1 h-7 w-full" />
          </div>
          <p class="min-w-0 flex-1 basis-64 text-base leading-snug">
            <span class="text-tape">Meurtre chez Marmelab.</span>
            Quelqu’un a été retrouvé sans vie dans les bureaux. Place chaque suspect, un par ligne
            et par colonne, et démasque le coupable.
          </p>
        </div>
      </header>
      <CastPanel
        :selected="game.selected"
        :placements="game.placements"
        @select="onSelect"
        @press="drag.press"
      />
    </div>
    <img
      v-if="drag.dragged.value"
      :src="avatarUrl(drag.dragged.value.person)"
      alt=""
      class="pointer-events-none fixed z-10 size-14 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
      :style="{ left: `${drag.dragged.value.x}px`, top: `${drag.dragged.value.y}px` }"
    />
  </main>
</template>
