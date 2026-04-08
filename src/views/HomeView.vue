<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import SessionHistoryLedger from '@/components/SessionHistoryLedger.vue'
import HubGrainLayer from '@/components/layout/HubGrainLayer.vue'
import MemoSecondaryNavButton from '@/components/ui/MemoSecondaryNavButton.vue'
import {
  navConfigureGame,
  navReturnToGame,
  primaryHeading,
} from '@/constants/appCopy'
import { useGameSessionStore } from '@/stores/gameSession'

defineOptions({ name: 'HomeView' })

const session = useGameSessionStore()
const { gameSession } = storeToRefs(session)

const showReturnToGame = computed(
  () => gameSession.value?.status === 'in_progress',
)
</script>

<template>
  <div
    class="relative isolate flex min-h-screen min-w-[320px] flex-col px-4 py-8 text-memo-text"
  >
    <div
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <HubGrainLayer />
    </div>
    <div class="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header class="text-center">
        <h1 class="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {{ primaryHeading }}
        </h1>
      </header>
      <div
        class="flex flex-wrap items-center justify-center gap-4"
        data-testid="home-action-row"
      >
        <MemoSecondaryNavButton
          v-if="showReturnToGame"
          variant="back"
          :label="navReturnToGame"
          data-testid="home-return-game"
          :to="{ name: 'game' }"
        />
        <MemoSecondaryNavButton
          variant="back"
          :label="navConfigureGame"
          data-testid="home-configure-game"
          :to="{ name: 'briefcase' }"
        />
      </div>
      <SessionHistoryLedger />
    </div>
  </div>
</template>
