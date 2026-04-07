<script setup lang="ts">
defineOptions({ name: 'AppPanel' })
</script>

<template>
  <div
    class="theme-app-panel rounded-memo-md border border-memo-border bg-memo-surface p-4 shadow-sm md:p-6"
  >
    <slot />
  </div>
</template>
