<script setup lang="ts">
import { pwaInstallFallbackHint } from '@/constants/appCopy'
import { usePwaInstallFallbackHint } from '@/composables/pwa/usePwaInstallFallbackHint'

const { showFallbackHint } = usePwaInstallFallbackHint()
</script>

<template>
  <p
    v-if="showFallbackHint"
    class="mx-auto mt-3 max-w-xl text-pretty text-center text-xs leading-relaxed text-slate-400"
    data-testid="pwa-install-fallback-hint"
    role="status"
  >
    {{ pwaInstallFallbackHint }}
  </p>
</template>
