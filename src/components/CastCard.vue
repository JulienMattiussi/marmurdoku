<script setup lang="ts">
/**
 * A card of the cast panel, on old paper (or ink, for the cross): a click
 * picks it, a press starts dragging it. Pressed, it tilts in a red ring.
 */
defineProps<{ pressed: boolean; dark?: boolean }>()
const emit = defineEmits<{ pick: []; press: [event: PointerEvent] }>()
</script>

<template>
  <button
    type="button"
    class="short:py-0.5 flex h-full w-full cursor-grab touch-none items-center gap-2 rounded-sm px-2 py-1 text-left transition-transform hover:-rotate-1 focus-visible:outline-3 focus-visible:outline-tape"
    :class="[
      dark ? 'bg-ink text-paper shadow-lg' : 'paper',
      { 'ring-blood-bright -rotate-1 ring-4': pressed },
    ]"
    :aria-pressed="pressed"
    @click="emit('pick')"
    @pointerdown="emit('press', $event)"
  >
    <slot name="icon" />
    <span class="short:gap-0.5 flex min-w-0 flex-col gap-1 leading-tight">
      <slot />
    </span>
  </button>
</template>
