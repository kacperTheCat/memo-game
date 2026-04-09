<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameCanvasShell from '@/components/GameCanvasShell.vue'
import WinDebriefPanel from '@/components/WinDebriefPanel.vue'
import MemoConfirmDialog from '@/components/ui/MemoConfirmDialog.vue'
import MemoSecondaryNavButton from '@/components/ui/MemoSecondaryNavButton.vue'
import rawLibrary from '@/data/tile-library.json'
import { useActivePlayTime } from '@/composables/useActivePlayTime'
import { buildGridCells } from '@/game/buildGridLayout'
import { gameShellMaxWidthStyle } from '@/game/gameShellLayout'
import {
  clearReloadNewGameDifficulty,
  setReloadNewGameDifficulty,
} from '@/game/reloadNewGameDifficulty'
import { isDifficulty } from '@/game/isDifficulty'
import type { TileLibraryFile } from '@/game/tileLibraryTypes'
import {
  abandonGameConfirm,
  memoConfirmAbandonTitle,
  memoConfirmButtonAbandon,
  memoConfirmButtonCancel,
  navAbandonGame,
  navReturnToBriefcase,
} from '@/constants/appCopy'
import { persistPlayerSettingsFromStore } from '@/game/playerSettingsStorage'
import { useGamePlayStore } from '@/stores/gamePlay'
import { useGameSessionStore } from '@/stores/gameSession'
import { useGameSettingsStore } from '@/stores/gameSettings'

const lib = rawLibrary as TileLibraryFile
const entries = lib.entries

const settings = useGameSettingsStore()
const play = useGamePlayStore()
const session = useGameSessionStore()
const route = useRoute()
const router = useRouter()

const showDebrief = ref(false)
const showAbandonDialog = ref(false)

useActivePlayTime((ms) => session.addActiveMs(ms))

function applyRouteQuery(): void {
  const d = route.query.difficulty
  if (isDifficulty(d)) {
    settings.difficulty = d
  }
  const s = route.query.seed
  if (typeof s === 'string' && s.length > 0) {
    settings.dealSeed = s
  }
  persistPlayerSettingsFromStore(settings)
}

applyRouteQuery()
watch(() => route.query, applyRouteQuery)

watch(
  () => session.gameSession?.status,
  (st) => {
    if (st === 'won' && session.gameSession) {
      setReloadNewGameDifficulty(session.gameSession.difficulty)
      showDebrief.value = true
    }
  },
)

watch([showDebrief, () => session.gameSession?.status], () => {
  if (showDebrief.value && session.gameSession?.status !== 'won') {
    showDebrief.value = false
  }
})

function returnToBriefcaseDuringPlay(): void {
  session.flushSave(play.memory)
  void router.push({ name: 'briefcase' })
}

function onAbandonClick(): void {
  showAbandonDialog.value = true
}

function onAbandonDialogCancel(): void {
  showAbandonDialog.value = false
}

function onAbandonDialogConfirm(): void {
  showAbandonDialog.value = false
  session.finalizeSession('abandoned')
  clearReloadNewGameDifficulty()
  play.resetRound()
  session.clearSession()
  void router.push({ name: 'briefcase' })
}

function onGameWon(): void {
  showDebrief.value = true
}

function onPlayAgain(): void {
  const gs = session.gameSession
  if (!gs || gs.status !== 'won') {
    return
  }
  const d = gs.difficulty
  clearReloadNewGameDifficulty()
  session.beginSession(d)
  settings.$patch({ difficulty: d })
  play.startNewRound(buildGridCells(entries, d), Math.random)
  showDebrief.value = false
  session.flushSave(play.memory)
}

/**
 * Navigate first: clearing session / hiding debrief before `push` completes remounts
 * `GameCanvasShell` on `/game`, whose `stripMemoDealFromHistory()` `replace` can race and
 * cancel this navigation (e2e: return to briefcase).
 */
async function onReturnBriefcase(): Promise<void> {
  await router.push({ name: 'briefcase' })
}
</script>

<template>
  <div
    v-if="showDebrief"
    class="min-h-screen bg-[#211c11]"
  >
    <WinDebriefPanel
      @play-again="onPlayAgain"
      @return-briefcase="onReturnBriefcase"
    />
  </div>
  <div
    v-else
    class="relative flex min-h-screen min-w-[320px] flex-col bg-memo-bg px-4 py-6 text-memo-text"
  >
    <header
      class="relative z-10 mb-4 mx-auto flex w-full items-center justify-between gap-3"
      :style="gameShellMaxWidthStyle()"
    >
      <MemoSecondaryNavButton
        variant="back"
        :label="navReturnToBriefcase"
        data-testid="game-return-briefcase"
        @click="returnToBriefcaseDuringPlay"
      />
      <MemoSecondaryNavButton
        variant="dismiss"
        :label="navAbandonGame"
        data-testid="game-abandon-game"
        @click="onAbandonClick"
      />
    </header>
    <p
      v-if="session.storageError"
      class="relative z-10 mb-2 text-center text-sm text-amber-400"
      role="status"
    >
      {{ session.storageError }}
    </p>
    <main class="relative z-10 flex flex-1 flex-col items-center justify-center">
      <div
        class="relative mx-auto w-full"
        :style="gameShellMaxWidthStyle()"
      >
        <GameCanvasShell @won="onGameWon" />
      </div>
    </main>
    <MemoConfirmDialog
      :open="showAbandonDialog"
      variant="danger"
      :title="memoConfirmAbandonTitle"
      :message="abandonGameConfirm"
      :confirm-label="memoConfirmButtonAbandon"
      :cancel-label="memoConfirmButtonCancel"
      @confirm="onAbandonDialogConfirm"
      @cancel="onAbandonDialogCancel"
    />
  </div>
</template>
