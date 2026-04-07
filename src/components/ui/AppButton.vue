<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineOptions({ name: 'AppButton' })

defineProps<{
  /** When set, renders as RouterLink */
  to?: string
}>()
</script>

<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="theme-nav-link rounded-[var(--memo-radius-md)] border border-memo-border bg-memo-surface px-4 py-2 text-sm font-medium text-memo-text transition-colors hover:border-white/20 hover:bg-memo-surface-hover"
  >
    <slot />
  </RouterLink>
  <button
    v-else
    type="button"
    class="theme-nav-link rounded-[var(--memo-radius-md)] border border-memo-border bg-memo-surface px-4 py-2 text-sm font-medium text-memo-text transition-colors hover:border-white/20 hover:bg-memo-surface-hover"
  >
    <slot />
  </button>
</template>
