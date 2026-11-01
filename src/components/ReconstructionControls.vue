<script setup lang="ts">
/** Over the map while the reconstruction plays: a click moves on, "Passer" goes to the end. */
const emit = defineEmits<{ next: []; skip: [] }>()
</script>

<template>
  <button
    type="button"
    class="absolute inset-0 cursor-pointer"
    aria-label="Image suivante de la reconstitution"
    @click="emit('next')"
  />
  <button
    type="button"
    class="bg-ink/85 text-tape hover:bg-blood hover:text-bone absolute top-2 right-2 rounded-sm px-3 py-1 text-sm font-bold tracking-widest uppercase shadow-lg"
    @click="emit('skip')"
  >
    Passer ⏭
  </button>
</template>
