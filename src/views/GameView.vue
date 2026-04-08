<script setup lang="ts">
import GameCanvasShell from '@/components/GameCanvasShell.vue'
import AppButton from '@/components/ui/AppButton.vue'
import rawLibrary from '@/data/tile-library.json'
import { useActivePlayTime } from '@/composables/useActivePlayTime'
import { buildGridCells } from '@/game/buildGridLayout'
import type { TileLibraryFile } from '@/game/tileLibraryTypes'
import { gamePageHeading, gamePageSubline, navToHome } from '@/constants/appCopy'
import { useGamePlayStore } from '@/stores/gamePlay'
import { useGameSessionStore } from '@/stores/gameSession'
import { useGameSettingsStore } from '@/stores/gameSettings'

const lib = rawLibrary as TileLibraryFile
const entries = lib.entries

const settings = useGameSettingsStore()
const play = useGamePlayStore()
const session = useGameSessionStore()

useActivePlayTime((ms) => session.addActiveMs(ms))

function confirmAbandon(): void {
  if (
    !window.confirm(
      'Abandon this game? A record will be saved for statistics (outcome: abandoned).',
    )
  ) {
    return
  }
  session.finalizeSession('abandoned')
  session.beginSession(settings.difficulty, { dealBriefcaseSeedRaw: '' })
  play.startNewRound(buildGridCells(entries, settings.difficulty), Math.random, {
    dealInitKind: 'random',
  })
}
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
        <GameCanvasShell class="pt-10" />
      </div>
    </main>
  </div>
</template>
