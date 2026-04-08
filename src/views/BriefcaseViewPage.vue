<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import BriefcaseView from '@/components/briefcase/BriefcaseView.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useBriefcaseNavigateToGame } from '@/composables/useBriefcaseNavigateToGame'
import { navToGame, navToHome } from '@/constants/appCopy'
import { isBriefcaseSeedIncompleteEntry } from '@/game/seedDeal'
import { useGameSettingsStore } from '@/stores/gameSettings'
import HubGrainLayer from '@/components/layout/HubGrainLayer.vue'

const { navigateToGame } = useBriefcaseNavigateToGame()
const settings = useGameSettingsStore()
const { briefcaseSeedRaw } = storeToRefs(settings)
const seedBlocksNav = computed(
  () =>
    isBriefcaseSeedIncompleteEntry(briefcaseSeedRaw.value) &&
    settings.briefcaseSeedIncompleteAfterBlur,
)
</script>

<template>
  <div
    data-testid="briefcase-view"
    class="relative isolate flex min-h-screen min-w-[320px] flex-col px-4 py-8 text-memo-text"
  >
    <div
      data-testid="briefcase-backdrop"
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <HubGrainLayer />
      <!-- Ambient glows per designs/.../the_briefcase_main_menu/code.html -->
      <div
        class="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-memo-accent/10 blur-[100px] motion-safe:animate-pulse"
      />
      <div
        class="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-purple-900/10 blur-[100px] motion-safe:animate-pulse motion-safe:[animation-delay:1.25s]"
      />
    </div>
    <div class="relative z-10 mx-auto flex w-full max-w-[480px] flex-col">
      <div class="mb-6 flex flex-wrap justify-end gap-2">
        <AppButton
          data-testid="nav-to-game"
          :disabled="seedBlocksNav"
          @click="navigateToGame"
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
