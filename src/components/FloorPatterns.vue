<script setup lang="ts">
/**
 * SVG patterns for every FloorKind, referenced as url(#floor-<kind>). Sizes are
 * in map units (one cell is CELL wide), so a pattern tiles seamlessly across
 * neighboring cells of the same room.
 */
</script>

<template>
  <defs>
    <pattern id="floor-oak" width="48" height="24" patternUnits="userSpaceOnUse">
      <rect width="48" height="24" fill="#e9cf9f" />
      <rect y="12" width="48" height="12" fill="#e3c792" />
      <path d="M0 12H48M0 24H48M30 0V12M10 12V24" stroke="#cfae78" stroke-width="1" />
    </pattern>
    <pattern id="floor-carpet" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#a9aeb6" />
      <circle cx="3" cy="4" r="0.9" fill="#9a9fa8" />
      <circle cx="9" cy="2" r="0.7" fill="#b7bcc3" />
      <circle cx="7" cy="9" r="0.9" fill="#9a9fa8" />
      <circle cx="1" cy="10" r="0.6" fill="#b7bcc3" />
    </pattern>
    <pattern id="floor-planks" width="96" height="16" patternUnits="userSpaceOnUse">
      <rect width="96" height="16" fill="#dcb57c" />
      <rect y="8" width="96" height="8" fill="#d6ad72" />
      <path d="M0 8H96M0 16H96M60 0V8M20 8V16" stroke="#bf975e" stroke-width="1" />
    </pattern>
    <pattern id="floor-herringbone" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="24" height="24" fill="#cfa577" />
      <path d="M0 12L12 0L24 12M0 24L12 12L24 24" stroke="#b8895a" stroke-width="1.5" fill="none" />
    </pattern>
    <pattern id="floor-walnut" width="48" height="12" patternUnits="userSpaceOnUse">
      <rect width="48" height="12" fill="#8d5f40" />
      <rect y="6" width="48" height="6" fill="#86583a" />
      <path d="M0 6H48M0 12H48M14 0V6M38 6V12" stroke="#6f472d" stroke-width="1" />
    </pattern>
    <pattern id="floor-tiles" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="#eef2f4" />
      <path d="M0 0H16M0 0V16" stroke="#cfd8de" stroke-width="1.5" />
    </pattern>
    <pattern id="floor-concrete" width="48" height="48" patternUnits="userSpaceOnUse">
      <rect width="48" height="48" fill="#cdd0cc" />
      <circle cx="9" cy="14" r="1" fill="#b8bbb6" />
      <circle cx="33" cy="6" r="1.2" fill="#b8bbb6" />
      <circle cx="26" cy="35" r="1" fill="#babdb8" />
      <circle cx="42" cy="28" r="0.8" fill="#b4b7b2" />
      <circle cx="14" cy="41" r="1.1" fill="#b8bbb6" />
      <path d="M0 0H48M0 0V48" stroke="#bfc2bd" stroke-width="1" />
    </pattern>
    <pattern id="floor-paving" width="32" height="16" patternUnits="userSpaceOnUse">
      <rect width="32" height="16" fill="#bdb4a3" />
      <path d="M0 0H32M0 8H32M0 0V8M16 8V16" stroke="#a69c8a" stroke-width="1.2" />
    </pattern>
    <pattern id="void" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#3d4250" />
      <path d="M-3 3L3 -3M0 12L12 0M9 15L15 9" stroke="#4c5262" stroke-width="2" />
    </pattern>
    <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity="0.25" />
    </filter>
  </defs>
</template>
