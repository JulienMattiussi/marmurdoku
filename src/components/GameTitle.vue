<script setup lang="ts">
import BloodDrip from '@/components/BloodDrip.vue'

/** "Marmurdoku" in horror letters, with blood dripping from it; `big` on the share image. */
defineProps<{ big?: boolean }>()
</script>

<template>
  <div class="w-fit shrink-0">
    <h1
      class="font-horror text-blood-bright leading-none drop-shadow-[0_3px_0_#000]"
      :class="big ? 'text-[6.4rem]' : 'short:text-5xl text-6xl'"
    >
      Marmurdoku
    </h1>
    <BloodDrip
      class="text-blood-bright w-full"
      :class="big ? '-mt-2 h-12' : 'short:h-5 -mt-1 h-7'"
    />
  </div>
</template>
