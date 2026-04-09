<script setup lang="ts">
/** Full-viewport navy/black base + SVG noise (007 US4); E2E: `data-testid="hub-grain-layer"`. */
defineOptions({ name: 'HubGrainLayer' })
</script>

<template>
  <div
    data-testid="hub-grain-layer"
    class="pointer-events-none absolute inset-0 overflow-hidden"
    aria-hidden="true"
  >
    <div class="hub-grain-vignette absolute inset-0" />
    <div
      class="hub-grain-noise hub-grain-noise-drift absolute inset-0"
      data-testid="hub-grain-noise"
    />
  </div>
</template>

<style scoped>
.hub-grain-vignette {
  background:
    radial-gradient(ellipse 130% 90% at 50% -15%, rgb(30 58 138 / 0.38) 0%, transparent 52%),
    radial-gradient(ellipse 90% 70% at 100% 100%, rgb(15 23 42 / 0.55) 0%, transparent 45%),
    #050810;
}

/* Same feTurbulence + opacity as WinDebriefPanel `.noise-bg` (007 FR-009 reference bar). */
.hub-grain-noise {
  opacity: 0.07;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
  background-size: 220px 220px;
}

@media (prefers-reduced-motion: no-preference) {
  .hub-grain-noise-drift {
    animation: memo-hub-grain-drift 22s linear infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hub-grain-noise-drift {
    animation: none;
  }
}

@keyframes memo-hub-grain-drift {
  0% {
    background-position: 0% 0%;
  }
  25% {
    background-position: 3% -2%;
  }
  50% {
    background-position: -2% 2%;
  }
  75% {
    background-position: 2% 3%;
  }
  100% {
    background-position: 0% 0%;
  }
}
</style>
