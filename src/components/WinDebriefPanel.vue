<script setup lang="ts">
import { computed } from 'vue'
import SessionHistoryLedger from '@/components/SessionHistoryLedger.vue'
import MemoSecondaryNavButton from '@/components/ui/MemoSecondaryNavButton.vue'
import {
  formatActivePlayMsAsMmSs,
} from '@/game/winDebriefFormat'
import { filterWonSessionsNewestFirst } from '@/game/winDebriefHistory'
import { navReturnToBriefcase } from '@/constants/appCopy'
import { useGameSessionStore } from '@/stores/gameSession'

defineOptions({ name: 'WinDebriefPanel' })

const emit = defineEmits<{
  'play-again': []
  'return-briefcase': []
}>()

const session = useGameSessionStore()

const summary = computed(() => {
  const gs = session.gameSession
  if (gs?.status === 'won') {
    return {
      time: formatActivePlayMsAsMmSs(gs.activePlayMs),
      moves: gs.clickCount,
      difficulty: gs.difficulty,
    }
  }
  const list = filterWonSessionsNewestFirst(session.readCompletedList())
  const row = list[0]
  if (!row) {
    return null
  }
  return {
    time: formatActivePlayMsAsMmSs(row.activePlayMs),
    moves: row.clickCount,
    difficulty: row.difficulty,
  }
})
</script>

<template>
  <div
    data-testid="win-debrief-root"
    class="win-debrief relative min-h-screen min-h-[100dvh] overflow-x-hidden bg-[#211c11] text-gray-100"
  >
    <div
      class="debrief-gradient pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
    <div
      class="noise-bg pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
    />
    <header class="relative z-[2] mx-auto flex w-full max-w-7xl items-center p-6">
      <MemoSecondaryNavButton
        variant="back"
        :label="navReturnToBriefcase"
        data-testid="win-return-briefcase"
        @click="emit('return-briefcase')"
      />
    </header>
    <main
      class="relative z-[2] mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8"
    >
      <div class="flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
        <div class="flex w-full flex-col gap-8 lg:w-5/12">
          <div class="space-y-2">
            <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-[#e5aa34]">
              Post-Match Debrief
            </h2>
            <h1
              class="text-4xl font-bold leading-tight text-transparent drop-shadow-[0_0_15px_rgba(229,170,52,0.3)] sm:text-5xl"
              style="
                background: linear-gradient(135deg, #e5aa34 0%, #ffdf99 100%);
                -webkit-background-clip: text;
                background-clip: text;
              "
            >
              Operation Complete
            </h1>
          </div>
          <div
            v-if="summary"
            class="grid grid-cols-2 gap-4"
          >
            <div
              class="glass-panel relative overflow-hidden rounded-2xl p-6"
            >
              <span class="relative z-10 mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-gray-400">Time Elapsed</span>
              <div
                data-testid="win-summary-time"
                class="relative z-10 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                {{ summary.time }}
              </div>
            </div>
            <div
              class="glass-panel relative overflow-hidden rounded-2xl p-6"
            >
              <span class="relative z-10 mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-gray-400">Moves Taken</span>
              <div
                data-testid="win-summary-moves"
                class="relative z-10 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                {{ summary.moves }}
              </div>
            </div>
          </div>
          <div class="pt-4">
            <button
              type="button"
              data-testid="win-play-again"
              class="flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-[#e5aa34] font-bold text-lg text-[#211c11] shadow-[0_0_30px_rgba(229,170,52,0.2)] transition-all hover:scale-[1.02] hover:brightness-110"
              @click="emit('play-again')"
            >
              <span aria-hidden="true">↻</span>
              Play Again
            </button>
          </div>
        </div>
        <div class="flex w-full flex-col gap-6 lg:w-7/12">
          <SessionHistoryLedger />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Stitch / code.html: dark brown base + warm gold glow + grain */
.debrief-gradient {
  background: radial-gradient(
    ellipse 120% 80% at 50% -20%,
    rgba(229, 170, 52, 0.22) 0%,
    rgba(229, 170, 52, 0.06) 28%,
    #211c11 55%,
    #16130c 100%
  );
}

.noise-bg {
  opacity: 0.07;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

.glass-panel {
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      transparent 100%
    ),
    rgba(10, 8, 5, 0.52);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 24px 48px rgba(0, 0, 0, 0.45);
}
</style>
