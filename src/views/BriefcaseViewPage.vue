<script setup lang="ts">
import BriefcaseView from '@/components/briefcase/BriefcaseView.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { navToGame, navToHome } from '@/constants/appCopy'
</script>

<template>
  <div
    data-testid="briefcase-view"
    class="relative isolate flex min-h-screen min-w-[320px] flex-col px-4 py-8 text-memo-text"
  >
    <div
      data-testid="briefcase-backdrop"
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-memo-bg"
      aria-hidden="true"
    >
      <!-- Ambient glows per designs/.../the_briefcase_main_menu/code.html -->
      <div
        class="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-memo-accent/10 blur-[100px] motion-safe:animate-pulse"
      />
      <div
        class="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-purple-900/10 blur-[100px] motion-safe:animate-pulse motion-safe:[animation-delay:1.25s]"
      />
      <div
        class="memo-backdrop-noise absolute inset-0"
      />
    </div>
    <div class="relative z-10 mx-auto flex w-full max-w-[480px] flex-col">
      <div class="mb-6 flex flex-wrap justify-end gap-2">
        <AppButton
          to="/game"
          data-testid="nav-to-game"
        >
          {{ navToGame }}
        </AppButton>
        <AppButton
          to="/"
          data-testid="nav-to-home"
        >
          {{ navToHome }}
        </AppButton>
      </div>
      <BriefcaseView />
    </div>
  </div>
</template>
