<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

defineOptions({ name: 'MemoSecondaryNavButton' })

const props = defineProps<{
  variant: 'back' | 'forward' | 'dismiss'
  label: string
  /** When set, renders as RouterLink. Otherwise a button that emits `click`. */
  to?: RouteLocationRaw
  dataTestid?: string
}>()

const emit = defineEmits<{
  click: []
}>()

const navClass =
  'group inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium uppercase tracking-wide text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30'

const iconGlyph = computed(() => {
  const m = { back: 'arrow_back', forward: 'arrow_forward', dismiss: 'close' } as const
  return m[props.variant]
})

const iconMotionClass = computed(() => {
  if (props.variant === 'back') return 'group-hover:-translate-x-1'
  if (props.variant === 'forward') return 'group-hover:translate-x-1'
  return ''
})

/** Forward (Return to Game): label first, icon after. Back / dismiss: icon before label. */
const iconSpacingClass = computed(() =>
  props.variant === 'forward' ? 'ml-2' : 'mr-2',
)
</script>

<template>
  <RouterLink
    v-if="to !== undefined"
    :to="to"
    :data-testid="dataTestid"
    :class="navClass"
  >
    <template v-if="variant === 'forward'">
      {{ label }}
      <span
        class="material-symbols-outlined transition-transform"
        :class="[iconSpacingClass, iconMotionClass]"
        aria-hidden="true"
      >{{ iconGlyph }}</span>
    </template>
    <template v-else>
      <span
        class="material-symbols-outlined transition-transform"
        :class="[iconSpacingClass, iconMotionClass]"
        aria-hidden="true"
      >{{ iconGlyph }}</span>
      {{ label }}
    </template>
  </RouterLink>
  <button
    v-else
    type="button"
    :data-testid="dataTestid"
    :class="navClass"
    @click="emit('click')"
  >
    <template v-if="variant === 'forward'">
      {{ label }}
      <span
        class="material-symbols-outlined transition-transform"
        :class="[iconSpacingClass, iconMotionClass]"
        aria-hidden="true"
      >{{ iconGlyph }}</span>
    </template>
    <template v-else>
      <span
        class="material-symbols-outlined transition-transform"
        :class="[iconSpacingClass, iconMotionClass]"
        aria-hidden="true"
      >{{ iconGlyph }}</span>
      {{ label }}
    </template>
  </button>
</template>
