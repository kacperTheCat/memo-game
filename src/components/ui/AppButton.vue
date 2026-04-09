<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { playUiClick } from '@/audio/gameSfx'

defineOptions({ name: 'AppButton' })

const props = defineProps<{
  /** When set, renders as RouterLink */
  to?: string
  /** Native button only; ignored when `to` is set */
  disabled?: boolean
}>()

const buttonClass = computed(() => {
  const base =
    'theme-nav-link rounded-[var(--memo-radius-md)] border border-memo-border bg-memo-surface px-4 py-2 text-sm font-medium text-memo-text transition-colors hover:border-white/20 hover:bg-memo-surface-hover'
  return props.disabled ? `${base} cursor-not-allowed opacity-50` : base
})

function onLinkActivate(): void {
  playUiClick()
}

function onButtonActivate(): void {
  if (props.disabled) {
    return
  }
  playUiClick()
}
</script>

<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="theme-nav-link rounded-[var(--memo-radius-md)] border border-memo-border bg-memo-surface px-4 py-2 text-sm font-medium text-memo-text transition-colors hover:border-white/20 hover:bg-memo-surface-hover"
    @click="onLinkActivate"
  >
    <slot />
  </RouterLink>
  <button
    v-else
    type="button"
    :disabled="disabled"
    :class="buttonClass"
    @click="onButtonActivate"
  >
    <slot />
  </button>
</template>
