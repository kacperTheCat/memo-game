<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import {
  pwaInstallBody,
  pwaInstallButtonDismiss,
  pwaInstallButtonInstall,
  pwaInstallTitle,
} from '@/constants/appCopy'
import { usePwaInstallPrompt } from '@/composables/pwa/usePwaInstallPrompt'

const { visible, confirmInstall, dismiss } = usePwaInstallPrompt()

async function onInstall(): Promise<void> {
  await confirmInstall()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="pointer-events-auto fixed inset-x-0 bottom-0 z-[80] flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      data-testid="pwa-install-sheet"
      role="dialog"
      aria-modal="false"
      :aria-label="pwaInstallTitle"
    >
      <div
        class="w-full max-w-lg rounded-[var(--memo-radius-glass)] border border-memo-border bg-memo-glass-fill p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.1),0_24px_48px_rgb(0_0_0/0.5)] backdrop-blur-[24px] backdrop-saturate-150 motion-reduce:border-memo-border motion-reduce:bg-[rgb(20_25_36)] motion-reduce:backdrop-blur-none motion-reduce:shadow-lg md:p-6"
      >
        <h2 class="text-lg font-semibold tracking-tight text-slate-100">
          {{ pwaInstallTitle }}
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-slate-300">
          {{ pwaInstallBody }}
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <AppButton @click="onInstall">
            {{ pwaInstallButtonInstall }}
          </AppButton>
          <button
            type="button"
            class="rounded-[var(--memo-radius-md)] border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            @click="dismiss"
          >
            {{ pwaInstallButtonDismiss }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
