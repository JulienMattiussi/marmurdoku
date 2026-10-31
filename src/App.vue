<script setup lang="ts">
import OfficeMap from '@/components/OfficeMap.vue'
import { FURNITURE, ZONE_GRID } from '@/data/office'
import { MURDERER, VICTIM } from '@/data/people'
import { SOLUTION } from '@/data/solution'
import { ZONES } from '@/data/zones'
import { placeableGrid } from '@/lib/furniture'
import { parseZoneGrid } from '@/lib/grid'
import { parseCellName, solutionProblems } from '@/lib/solution'

/** Debug mode (?debug in the URL): shows the solution and checks it. */
const debug = new URLSearchParams(location.search).has('debug')

const solution = Object.fromEntries(
  Object.entries(SOLUTION).map(([id, name]) => [id, parseCellName(name)]),
)
const zones = parseZoneGrid(ZONE_GRID, ZONES)
const problems = debug
  ? solutionProblems(solution, zones, placeableGrid(zones, FURNITURE), VICTIM, MURDERER)
  : []
</script>

<template>
  <main class="mx-auto flex max-w-[82rem] flex-col gap-8 px-4 py-10 lg:py-16">
    <header class="flex flex-col gap-4">
      <p class="text-sm leading-none font-semibold">(01) Meurtre chez Marmelab</p>
      <h1
        class="text-[2.5rem] leading-[2.625rem] font-medium tracking-[-0.05rem] xl:text-6xl xl:leading-[3.8rem] xl:tracking-[-0.075rem]"
      >
        <span class="highlight">Marmerdoku</span>
      </h1>
      <p class="text-deep-blue max-w-2xl text-xl leading-8">
        François a été retrouvé sans vie dans les bureaux. Place chaque employé, un par ligne et par
        colonne, et démasque le coupable.
      </p>
    </header>
    <section
      v-if="debug"
      class="border-deep-blue/20 max-w-[960px] rounded border bg-white p-4 text-sm"
      aria-label="Mode debug"
    >
      <p class="font-semibold">Mode debug : solution affichée, cases non plaçables en rouge.</p>
      <p v-if="!problems.length" class="text-deep-blue">
        Solution valide : aucune règle enfreinte.
      </p>
      <ul v-else class="list-disc pl-5 text-[#d7263d]">
        <li v-for="problem in problems" :key="problem">{{ problem }}</li>
      </ul>
    </section>
    <div class="max-w-[960px]">
      <OfficeMap :placements="debug ? solution : undefined" :show-blocked="debug" />
    </div>
  </main>
</template>
