<script setup lang="ts">
import GameCanvasShell from '@/components/GameCanvasShell.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { gamePageHeading, gamePageSubline, navToHome } from '@/constants/appCopy'
</script>

<template>
  <div
    class="flex min-h-screen min-w-[320px] flex-col bg-memo-bg px-4 py-8 text-memo-text"
  >
    <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold tracking-tight md:text-2xl">
          {{ gamePageHeading }}
        </h1>
        <p class="mt-1 text-sm text-memo-muted">
          {{ gamePageSubline }}
        </p>
      </div>
      <AppButton
        to="/"
        data-testid="nav-to-home"
      >
        {{ navToHome }}
      </AppButton>
    </header>
    <main class="flex flex-1 flex-col items-center justify-center">
      <GameCanvasShell />
    </main>
  </div>
</template>
