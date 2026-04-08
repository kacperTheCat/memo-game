<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameCanvasShell from '@/components/GameCanvasShell.vue'
import WinDebriefPanel from '@/components/WinDebriefPanel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import rawLibrary from '@/data/tile-library.json'
import { useActivePlayTime } from '@/composables/useActivePlayTime'
import { buildGridCells } from '@/game/buildGridLayout'
import {
  clearReloadNewGameDifficulty,
  setReloadNewGameDifficulty,
} from '@/game/reloadNewGameDifficulty'
import type { Difficulty, TileLibraryFile } from '@/game/tileLibraryTypes'
import { gamePageHeading, gamePageSubline, navToHome } from '@/constants/appCopy'
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

useActivePlayTime((ms) => session.addActiveMs(ms))

function isDifficulty(x: unknown): x is Difficulty {
  return x === 'easy' || x === 'medium' || x === 'hard'
}

function applyRouteQuery(): void {
  const d = route.query.difficulty
  if (isDifficulty(d)) {
    settings.difficulty = d
  }
  const s = route.query.seed
  if (typeof s === 'string' && s.length > 0) {
    settings.dealSeed = s
  }
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

function confirmAbandon(): void {
  if (
    !window.confirm(
      'Abandon this game? A record will be saved for statistics (outcome: abandoned).',
    )
  ) {
    return
  }
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

function onReturnBriefcase(): void {
  clearReloadNewGameDifficulty()
  session.clearSession()
  play.resetRound()
  showDebrief.value = false
  void router.push({ name: 'briefcase' })
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
    <p
      v-if="session.storageError"
      class="mb-2 text-center text-sm text-amber-400"
      role="status"
    >
      {{ session.storageError }}
    </p>
    <main class="relative flex flex-1 flex-col items-center justify-center">
      <div class="relative w-full max-w-[min(100%,1200px)]">
        <button
          type="button"
          class="absolute left-0 top-0 z-10 rounded border border-memo-border bg-memo-surface px-3 py-1.5 text-sm font-medium text-memo-text shadow hover:bg-memo-bg"
          data-testid="game-abandon-game"
          @click="confirmAbandon"
        >
          Abandon game
        </button>
        <GameCanvasShell
          class="pt-10"
          @won="onGameWon"
        />
      </div>
    </main>
  </div>
</template>
