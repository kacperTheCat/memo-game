<script setup lang="ts">
defineOptions({ name: 'GameCanvasShell' })

const props = withDefaults(
  defineProps<{
    width?: number
    height?: number
  }>(),
  { width: 320, height: 240 },
)
</script>

<template>
  <div
    class="game-canvas-shell mx-auto w-full max-w-md touch-manipulation px-2"
    data-testid="game-canvas-shell"
  >
    <canvas
      :width="props.width"
      :height="props.height"
      class="block max-h-[50vh] w-full rounded-lg border border-slate-700 bg-slate-900"
      role="img"
      aria-label="Game board canvas (placeholder)"
    />
  </div>
</template>
