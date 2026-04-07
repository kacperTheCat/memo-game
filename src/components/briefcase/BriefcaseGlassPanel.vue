<script setup lang="ts">
defineOptions({ name: 'BriefcaseGlassPanel' })
</script>

<template>
  <div
    data-testid="briefcase-glass-panel"
    class="rounded-[var(--memo-radius-glass)] border border-memo-border bg-memo-glass-fill p-8 shadow-[inset_0_1px_0_rgb(255_255_255/0.1),0_24px_48px_rgb(0_0_0/0.5)] backdrop-blur-[24px] backdrop-saturate-150 md:p-10 motion-reduce:border-memo-border motion-reduce:bg-[rgb(20_25_36)] motion-reduce:backdrop-blur-none motion-reduce:shadow-lg"
  >
    <slot />
  </div>
</template>
