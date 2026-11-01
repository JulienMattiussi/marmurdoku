<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * The rules of the game, in a modal over the page. The wording rules repeat
 * those at the top of data/clues.ts: keep them in step.
 */
const emit = defineEmits<{ close: [] }>()

const closeButton = ref<HTMLButtonElement>()
const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => {
  closeButton.value?.focus()
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div
    class="fixed inset-0 z-20 grid place-items-center bg-black/70 p-4"
    @click.self="emit('close')"
  >
    <section
      class="paper scrollbar-blood relative max-h-full w-full max-w-2xl overflow-y-auto rounded-sm px-6 py-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
    >
      <button
        ref="closeButton"
        type="button"
        class="text-blood hover:text-blood-bright absolute top-2 right-3 text-2xl leading-none"
        aria-label="Fermer les règles"
        @click="emit('close')"
      >
        ×
      </button>
      <h2 id="rules-title" class="font-horror text-blood mb-3 text-4xl leading-none">
        Règles du jeu
      </h2>

      <h3 class="font-bold tracking-widest uppercase">Le crime</h3>
      <ul class="mb-3 list-disc pl-5">
        <li>
          Place chaque suspect sur le plan : exactement une personne par ligne et par colonne.
        </li>
        <li>
          Ils se tiennent sur le sol, ou sur un meuble où ils peuvent s’asseoir ou s’allonger
          (chaise, tabouret, canapé, lit, tapis, toilettes, douche). Pas sur une table, une plante,
          un vélo…
        </li>
        <li>Le coupable était seul dans une zone avec la victime.</li>
      </ul>

      <h3 class="font-bold tracking-widest uppercase">Les indices</h3>
      <ul class="mb-3 list-disc pl-5">
        <li>
          « À côté de » : sur une case voisine (haut, bas, gauche ou droite), dans la même zone. On
          n’est jamais à côté de quelque chose à travers un mur.
        </li>
        <li>« Avec quelqu’un » : dans la même zone.</li>
        <li>« Seul » : seul dans sa zone.</li>
        <li>Les pièces à l’étage sont la Mezzanine et l’Aquarium.</li>
        <li>« Assis » peut être sur une chaise, un tabouret ou un canapé.</li>
      </ul>

      <h3 class="font-bold tracking-widest uppercase">Les commandes</h3>
      <ul class="list-disc pl-5">
        <li>Clic sur un suspect : il est sélectionné ; un clic sur la carte le dépose.</li>
        <li>
          Si aucun suspect n’est sélectionné, un clic sur une case y met une croix ; un second clic
          la retire.
        </li>
        <li>
          Ce qu’on pose sur une case remplace ce qui s’y trouvait ; cliquer sur le suspect
          sélectionné le retire de la carte.
        </li>
        <li>En mode Noter, un clic note ou retire une position possible du suspect sélectionné.</li>
        <li>On peut aussi glisser un suspect ou la Croix jusqu’à une case.</li>
      </ul>
    </section>
  </div>
</template>
