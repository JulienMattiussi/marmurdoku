<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { defaultName, type Save } from '@/lib/saves'

/** Save the grid under a name, or load or delete a saved one. */
defineProps<{ saves: Save[] }>()

const emit = defineEmits<{
  save: [name: string]
  load: [save: Save]
  remove: [id: string]
  close: []
}>()

const name = ref('')
/** A load or delete waiting for the player's yes, on one save. */
const pending = ref<{ action: 'load' | 'remove'; id: string } | null>(null)
const confirm = (save: Save) => {
  if (pending.value?.action === 'load') emit('load', save)
  else emit('remove', save.id)
  pending.value = null
}
const nameField = ref<HTMLInputElement>()
const when = (at: number) =>
  new Date(at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
const counts = (save: Save) => {
  const placed = Object.keys(save.state.placements).length
  return `${placed} suspect${placed > 1 ? 's' : ''} placé${placed > 1 ? 's' : ''}`
}
const submit = () => {
  emit('save', name.value)
  name.value = ''
}

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => {
  nameField.value?.focus()
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
      class="paper relative max-h-full w-full max-w-lg overflow-y-auto rounded-sm px-6 py-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saves-title"
    >
      <button
        type="button"
        class="text-blood hover:text-blood-bright absolute top-2 right-3 text-2xl leading-none"
        aria-label="Fermer les sauvegardes"
        @click="emit('close')"
      >
        ×
      </button>
      <h2 id="saves-title" class="font-horror text-blood mb-3 text-4xl leading-none">
        Sauvegardes
      </h2>

      <form class="mb-4 flex gap-2" @submit.prevent="submit">
        <input
          ref="nameField"
          v-model="name"
          type="text"
          class="border-ink/40 min-w-0 flex-1 rounded-sm border bg-white/60 px-2 py-1"
          :placeholder="defaultName(Date.now())"
          aria-label="Nom de la sauvegarde"
        />
        <button
          type="submit"
          class="bg-blood text-bone hover:bg-blood-bright rounded-sm px-3 py-1 font-bold tracking-wider uppercase"
        >
          Sauvegarder
        </button>
      </form>

      <p v-if="!saves.length" class="opacity-70">Aucune sauvegarde pour l’instant.</p>
      <ul v-else class="flex flex-col gap-2">
        <li
          v-for="save in saves"
          :key="save.id"
          class="border-ink/20 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm border bg-white/40 px-3 py-2"
        >
          <span class="flex min-w-40 flex-1 flex-col leading-tight">
            <span class="truncate font-bold">{{ save.name }}</span>
            <span class="text-xs opacity-70">{{ when(save.at) }} · {{ counts(save) }}</span>
          </span>
          <div v-if="pending?.id === save.id" class="flex w-full items-center justify-end gap-2">
            <span class="mr-auto text-sm font-bold">
              {{
                pending.action === 'load'
                  ? 'Charger (la grille actuelle sera remplacée) ?'
                  : 'Supprimer ?'
              }}
            </span>
            <button
              type="button"
              class="bg-blood text-bone hover:bg-blood-bright rounded-sm px-2 py-1 text-sm font-bold uppercase"
              @click="confirm(save)"
            >
              Oui
            </button>
            <button
              type="button"
              class="border-ink/40 rounded-sm border px-2 py-1 text-sm font-bold uppercase"
              @click="pending = null"
            >
              Non
            </button>
          </div>
          <template v-else>
            <button
              type="button"
              class="bg-ink text-tape hover:bg-blood hover:text-bone rounded-sm px-2 py-1 text-sm font-bold uppercase"
              :aria-label="`Charger ${save.name}`"
              @click="pending = { action: 'load', id: save.id }"
            >
              Charger
            </button>
            <button
              type="button"
              class="text-blood hover:text-blood-bright px-1 text-lg leading-none"
              :aria-label="`Supprimer ${save.name}`"
              @click="pending = { action: 'remove', id: save.id }"
            >
              🗑
            </button>
          </template>
        </li>
      </ul>
    </section>
  </div>
</template>
