import { computed, onUnmounted, ref } from 'vue'
import type { Frame } from '@/lib/reconstruction'

/**
 * Plays the reconstruction once the case is closed: first an invitation to
 * watch it, then its stills one after another (a click jumps to the next),
 * then the end message. "Passer" goes straight to the end.
 */
export const useReconstruction = (frames: () => Frame[]) => {
  const stage = ref<'intro' | 'playing' | 'end'>('intro')
  const index = ref(0)
  let played: Frame[] = []
  let timer: ReturnType<typeof setTimeout> | undefined

  /** The still on the map: the current one, and the last one (the murder) behind the end message. */
  const frame = computed(() =>
    stage.value === 'playing'
      ? played[index.value]
      : stage.value === 'end'
        ? played.at(-1)
        : undefined,
  )

  const show = (i: number) => {
    clearTimeout(timer)
    if (i >= played.length) {
      stage.value = 'end'
      return
    }
    index.value = i
    timer = setTimeout(() => show(i + 1), played[i]!.ms)
  }

  const play = () => {
    played = frames()
    stage.value = 'playing'
    show(0)
  }
  const next = () => {
    if (stage.value === 'playing') show(index.value + 1)
  }
  const skip = () => {
    clearTimeout(timer)
    stage.value = 'end'
  }
  const reset = () => {
    clearTimeout(timer)
    stage.value = 'intro'
  }
  onUnmounted(() => clearTimeout(timer))

  return { stage, frame, play, next, skip, reset }
}
