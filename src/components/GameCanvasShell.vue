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
  <div class="game-canvas-shell mx-auto w-full max-w-md touch-manipulation px-2">
    <canvas
      :width="props.width"
      :height="props.height"
      data-testid="game-canvas"
      class="block max-h-[50vh] w-full rounded-memo-md border border-memo-border bg-memo-surface"
      role="img"
      aria-label="Game board canvas (placeholder)"
    />
  </div>
</template>
