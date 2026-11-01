<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { avatarUrl, MURDERER, PEOPLE } from '@/data/people'
import type { ClueRef } from '@/lib/solver'

/** The most broken rules a failed check names. */
const SHOWN = 3

/**
 * The big message in front of the map after "Vérifier": case closed, or try
 * again with up to three broken rules, until the player's "OK".
 */
const props = defineProps<{ verdict: 'solved' | 'wrong'; broken: ClueRef[] }>()
const emit = defineEmits<{ ok: [] }>()

const murderer = PEOPLE.find((person) => person.id === MURDERER)!
const nameOf = (id: string) => PEOPLE.find((person) => person.id === id)!.name
const shown = computed(() =>
  props.broken.slice(0, SHOWN).map(({ person, text }) => ({
    person,
    text: person ? `${nameOf(person)} ${text}` : text,
  })),
)
const heading = computed(() =>
  props.broken.length > SHOWN
    ? `Au moins ces ${SHOWN} règles ne sont pas respectées`
    : props.broken.length > 1
      ? 'Ces règles ne sont pas respectées'
      : 'Cette règle n’est pas respectée',
)
const okButton = ref<HTMLButtonElement>()
onMounted(() => okButton.value?.focus())
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
      <p class="text-lg">{{ heading }} :</p>
      <ul class="flex flex-col gap-1 text-left">
        <li v-for="rule in shown" :key="rule.text" class="flex items-center gap-2">
          <img v-if="rule.person" :src="avatarUrl(rule.person)" alt="" class="size-8 shrink-0" />
          <span>« {{ rule.text }} »</span>
        </li>
      </ul>
      <button
        ref="okButton"
        type="button"
        class="bg-bone text-blood hover:bg-tape mt-2 rounded-sm px-6 py-1 font-bold tracking-widest uppercase focus-visible:outline-3 focus-visible:outline-tape"
        @click="emit('ok')"
      >
        OK
      </button>
    </div>
  </div>
</template>
