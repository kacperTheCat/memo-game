<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { playUiClick } from '@/audio/gameSfx'

defineOptions({ name: 'MemoConfirmDialog' })

const props = defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  /** `danger` — stronger accent on confirm (abandon). */
  variant?: 'danger' | 'neutral'
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = 'memo-confirm-title'
const descId = 'memo-confirm-desc'

const cancelBtnRef = ref<HTMLButtonElement | null>(null)

function onBackdropClick(): void {
  playUiClick()
  emit('cancel')
}

function onConfirmClick(): void {
  playUiClick()
  emit('confirm')
}

function onCancelClick(): void {
  playUiClick()
  emit('cancel')
}

function onKeydown(ev: KeyboardEvent): void {
  if (!props.open) return
  if (ev.key === 'Escape') {
    ev.preventDefault()
    emit('cancel')
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (typeof window === 'undefined') return
    if (isOpen) {
      window.addEventListener('keydown', onKeydown)
      await nextTick()
      cancelBtnRef.value?.focus()
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown)
  }
})

const confirmButtonClass = computed(() =>
  props.variant === 'danger'
    ? 'rounded-[var(--memo-radius-md)] bg-red-600/90 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(220,38,38,0.35)] transition hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80'
    : 'rounded-[var(--memo-radius-md)] bg-memo-accent px-4 py-2.5 text-sm font-semibold text-memo-cta-text shadow-[0_0_16px_rgb(228_168_52/0.35)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-memo-accent/80',
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        class="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        data-testid="memo-confirm-backdrop"
        @click="onBackdropClick"
      />
      <div
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descId"
        data-testid="memo-confirm-dialog"
        class="relative z-[1] w-full max-w-md rounded-[var(--memo-radius-md)] border border-memo-border bg-memo-bg/95 p-6 text-memo-text shadow-[0_0_40px_rgba(0,0,0,0.45)]"
        @click.stop
      >
        <h2
          :id="titleId"
          class="text-lg font-semibold tracking-tight text-memo-text"
        >
          {{ title }}
        </h2>
        <p
          :id="descId"
          data-testid="memo-confirm-message"
          class="mt-3 text-sm leading-relaxed text-memo-muted"
        >
          {{ message }}
        </p>
        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref="cancelBtnRef"
            type="button"
            data-testid="memo-confirm-cancel"
            class="rounded-[var(--memo-radius-md)] border border-memo-border bg-white/5 px-4 py-2.5 text-sm font-medium text-memo-text transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            @click="onCancelClick"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            data-testid="memo-confirm-confirm"
            :class="confirmButtonClass"
            @click="onConfirmClick"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
