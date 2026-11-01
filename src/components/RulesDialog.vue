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
          On se tient sur le sol, ou sur un meuble où l’on peut s’asseoir ou s’allonger (chaise,
          tabouret, canapé, lit, tapis, toilettes, douche). Pas sur une table, une plante, un vélo…
        </li>
        <li>Le coupable était seul dans une zone avec la victime.</li>
      </ul>

      <h3 class="font-bold tracking-widest uppercase">Les indices</h3>
      <ul class="mb-3 list-disc pl-5">
        <li>
          « À côté de » : sur une case voisine (en haut, en bas, à gauche ou à droite), dans la même
          zone. On n’est jamais à côté de quelque chose à travers un mur.
        </li>
        <li>« Avec quelqu’un » : dans la même zone.</li>
        <li>« Seul » : seul dans sa zone.</li>
        <li>Une zone « en hauteur » est à l’étage : la Mezzanine ou l’Aquarium.</li>
        <li>« Assis » peut être sur une chaise, un tabouret ou un canapé.</li>
      </ul>

      <h3 class="font-bold tracking-widest uppercase">Les commandes</h3>
      <ul class="list-disc pl-5">
        <li>Clic sur un suspect : il est sélectionné ; un second clic le lâche.</li>
        <li>Clic sur une case vide : y place le suspect sélectionné, ou y met une croix.</li>
        <li>Clic sur une case occupée : la vide.</li>
        <li>
          On peut aussi glisser un suspect jusqu’à une case : il remplace ce qui s’y trouvait.
        </li>
      </ul>
    </section>
  </div>
</template>
