<script setup lang="ts">
import FloorPatterns from '@/components/FloorPatterns.vue'
import GameTitle from '@/components/GameTitle.vue'
import MapPlan from '@/components/MapPlan.vue'
import { CELL } from '@/lib/geometry'

/**
 * The share image (1200x630, `make og`): the title over the night, the case
 * file's first lines, and the office plan as found, nobody on it. Tells
 * neither who died nor who did it.
 */
const SIZE = 20 * CELL
</script>

<template>
  <div class="og">
    <div class="og__copy">
      <GameTitle big />
      <p class="og__tagline">Meurtre chez Marmelab.</p>
      <p class="og__lead">
        Quelqu’un a été retrouvé sans vie dans les bureaux. Vingt suspects, un plan, des témoignages
        : à toi de démasquer le coupable.
      </p>
      <span class="stamp og__stamp">Affaire en cours</span>
    </div>

    <div class="og__map">
      <svg :viewBox="`-12 -12 ${SIZE + 24} ${SIZE + 24}`" aria-hidden="true">
        <FloorPatterns />
        <clipPath id="og-map">
          <rect :width="SIZE" :height="SIZE" />
        </clipPath>
        <g clip-path="url(#og-map)"><MapPlan /></g>
        <rect x="-4" y="-4" :width="SIZE + 8" :height="SIZE + 8" class="og__frame" />
      </svg>
    </div>

    <div class="crime-tape og__tape">
      <p class="crime-tape__text og__tape-text">
        Scène de crime · Ne pas franchir · Scène de crime · Ne pas franchir
      </p>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
}

.og {
  position: relative;
  width: 1200px;
  height: 630px;
  overflow: hidden;
  background-color: var(--color-night);
  background-image:
    radial-gradient(ellipse at 10% 0%, rgb(176 18 30 / 38%), transparent 55%),
    radial-gradient(ellipse at 100% 100%, rgb(94 9 16 / 45%), transparent 50%);
  color: var(--color-bone);
  font-family: var(--font-sans);
}

.og__copy {
  position: absolute;
  top: 70px;
  left: 64px;
  width: 560px;
}

.og__tagline {
  margin: 26px 0 0;
  font-size: 34px;
  color: var(--color-tape);
}

.og__lead {
  margin: 14px 0 0;
  font-size: 24px;
  line-height: 1.4;
}

.og__stamp {
  display: inline-block;
  margin-top: 30px;
  padding: 4px 12px;
  font-size: 22px;
  border-width: 3px;
}

.og__map {
  position: absolute;
  top: 52px;
  right: 56px;
  width: 500px;
  height: 500px;
  transform: rotate(3deg);
  filter: drop-shadow(0 18px 30px rgb(0 0 0 / 70%));
}

.og__map svg {
  width: 100%;
  height: 100%;
}

.og__frame {
  fill: none;
  stroke: var(--color-blood-dark);
  stroke-width: 8;
}

.og__tape {
  position: absolute;
  left: -60px;
  right: -60px;
  bottom: 34px;
  padding: 10px 0;
  transform: rotate(-3deg);
  box-shadow: 0 10px 24px rgb(0 0 0 / 55%);
}

.og__tape-text {
  width: fit-content;
  margin: 0 auto;
  padding: 2px 18px;
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
</style>
