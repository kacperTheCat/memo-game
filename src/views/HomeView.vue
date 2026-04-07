<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import {
  homeTagline,
  navToBriefcase,
  navToGame,
  primaryHeading,
} from '@/constants/appCopy'
</script>

<template>
  <div
    class="flex min-h-screen min-w-[320px] flex-col bg-memo-bg px-4 py-8 text-memo-text"
  >
    <header class="mb-6 text-center">
      <h1 class="text-2xl font-semibold tracking-tight md:text-3xl">
        {{ primaryHeading }}
      </h1>
      <p class="mt-2 text-sm text-memo-muted">
        {{ homeTagline }}
      </p>
    </header>
    <nav
      class="mb-6 flex flex-wrap items-center justify-center gap-3"
      aria-label="Main navigation"
    >
      <AppButton
        to="/game"
        data-testid="nav-to-game"
      >
        {{ navToGame }}
      </AppButton>
      <AppButton
        to="/briefcase"
        data-testid="nav-to-briefcase"
      >
        {{ navToBriefcase }}
      </AppButton>
    </nav>
    <main
      class="flex flex-1 flex-col items-center justify-center text-center text-memo-muted"
    >
      <p class="max-w-md text-sm">
        Choose <strong class="text-memo-text">{{ navToGame }}</strong> to open the game board, or
        <strong class="text-memo-text">{{ navToBriefcase }}</strong> for your themed overview.
      </p>
    </main>
  </div>
</template>
