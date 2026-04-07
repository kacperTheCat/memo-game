<script setup lang="ts">
import { onMounted } from 'vue'
import GameCanvasShell from '@/components/GameCanvasShell.vue'
import { documentTitle, primaryHeading } from '@/constants/appCopy'

onMounted(() => {
  document.title = documentTitle
})
</script>

<template>
  <div
    class="flex min-h-screen min-w-[320px] flex-col bg-slate-950 px-4 py-8 text-slate-100"
  >
    <header class="mb-6 text-center">
      <h1 class="text-2xl font-semibold tracking-tight md:text-3xl">
        {{ primaryHeading }}
      </h1>
      <p class="mt-2 text-sm text-slate-400">
        Counter-Strike 2 themed memory game — setup milestone
      </p>
    </header>
    <main class="flex flex-1 flex-col items-center">
      <GameCanvasShell />
    </main>
  </div>
</template>
