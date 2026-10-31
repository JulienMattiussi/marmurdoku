<script setup lang="ts">
import { avatarUrl, MURDERER, PEOPLE } from '@/data/people'

/** The big message in front of the map after "Vérifier": case closed, or try again. */
defineProps<{ verdict: 'solved' | 'wrong' }>()

const murderer = PEOPLE.find((person) => person.id === MURDERER)!
</script>

<template>
  <div
    class="absolute inset-0 grid place-items-center bg-black/55 p-6 backdrop-blur-[2px]"
    role="alert"
  >
    <div
      v-if="verdict === 'solved'"
      class="paper flex max-w-md -rotate-2 flex-col items-center gap-3 rounded-sm px-8 py-6 text-center"
    >
      <span class="stamp text-base">Affaire classée</span>
      <img :src="avatarUrl(murderer.id)" alt="" class="size-28" />
      <p class="font-horror text-blood text-5xl leading-none">{{ murderer.name }} !</p>
      <p class="text-lg">
        Seul avec la victime, c’est lui le coupable. Tous les suspects sont à leur place : bravo,
        inspecteur.
      </p>
    </div>
    <div
      v-else
      class="bg-blood text-bone flex max-w-md rotate-2 flex-col items-center gap-2 rounded-sm px-8 py-6 text-center shadow-2xl"
    >
      <p class="font-horror text-6xl leading-none">Raté !</p>
      <p class="text-lg">Un suspect au moins n’est pas à sa place. L’enquête continue…</p>
    </div>
  </div>
</template>
