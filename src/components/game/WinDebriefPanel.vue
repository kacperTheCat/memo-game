<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import MemoAmbientSpotlight from '@/components/ambient/MemoAmbientSpotlight.vue'
import SessionHistoryLedger from '@/components/game/SessionHistoryLedger.vue'
import MemoSecondaryNavButton from '@/components/ui/MemoSecondaryNavButton.vue'
import { playUiClick } from '@/audio/gameSfx'
import {
  formatActivePlayMsAsMmSs,
} from '@/game/win/winDebriefFormat'
import { filterWonSessionsNewestFirst } from '@/game/win/winDebriefHistory'
import { navReturnToBriefcase } from '@/constants/appCopy'
import { useGameSessionStore } from '@/stores/game/gameSession'

defineOptions({ name: 'WinDebriefPanel' })

const emit = defineEmits<{
  'play-again': []
  'return-briefcase': []
}>()

const session = useGameSessionStore()

function onPlayAgainClick(): void {
  playUiClick()
  emit('play-again')
}

const operationCompleteText = 'Operation Complete'
const operationChars = operationCompleteText.split('')

const prefersReducedMotion = ref(
  typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)
let motionMq: MediaQueryList | null = null
let onMotionChange: (() => void) | null = null

onMounted(() => {
  motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionMq.matches
  onMotionChange = () => {
    prefersReducedMotion.value = motionMq?.matches ?? false
  }
  motionMq.addEventListener('change', onMotionChange)
})

onUnmounted(() => {
  if (motionMq && onMotionChange) {
    motionMq.removeEventListener('change', onMotionChange)
  }
})

function charDelayMs(index: number): string {
  if (prefersReducedMotion.value) {
    return '0ms'
  }
  return `${index * 48}ms`
}

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
    <div
      class="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    >
      <MemoAmbientSpotlight />
    </div>
    <!-- Same shell as BriefcaseViewPage (`px-4 py-8`) + BriefcaseView hub nav (`gap-3`, `mb-6` vs `gap-6` to panel) -->
    <div
      class="relative z-[2] mx-auto flex w-full max-w-7xl flex-col px-4 py-8"
    >
      <div
        class="mb-6 flex flex-wrap items-center gap-3"
        data-testid="win-debrief-hub-nav"
      >
        <MemoSecondaryNavButton
          variant="back"
          :label="navReturnToBriefcase"
          data-testid="win-return-briefcase"
          @click="emit('return-briefcase')"
        />
      </div>
      <main class="flex flex-1 flex-col">
        <div class="flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
          <div class="flex w-full flex-col gap-8 lg:w-5/12">
            <div class="space-y-2">
              <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-[#e5aa34]">
                Post-Match Debrief
              </h2>
              <h1
                data-testid="operation-complete-heading"
                class="operation-complete-title whitespace-nowrap font-bold leading-tight drop-shadow-[0_0_15px_rgba(229,170,52,0.3)]"
              >
                <span
                  v-for="(ch, i) in operationChars"
                  :key="`${i}-${ch}`"
                  class="operation-complete-char operation-complete-char-gradient motion-reduce:!translate-y-0 motion-reduce:!opacity-100"
                  :class="prefersReducedMotion ? '' : 'operation-complete-char--animate'"
                  :style="{ animationDelay: charDelayMs(i) }"
                >{{ ch === ' ' ? '\u00a0' : ch }}</span>
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
                @click="onPlayAgainClick"
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

.operation-complete-title {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.02em;
  /* ~text-2xl on narrow phones → ~text-5xl on large screens; scales with viewport */
  font-size: clamp(1.5rem, 0.95rem + 3.25vw, 3rem);
}

.operation-complete-char {
  display: inline-block;
}

/* Per-glyph gradient so stagger animation is not clipped by parent background-clip */
.operation-complete-char-gradient {
  background: linear-gradient(135deg, #e5aa34 0%, #ffdf99 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.operation-complete-char--animate {
  opacity: 0;
  transform: translateY(0.2em);
  animation: memo-operation-complete-in 0.42s ease-out forwards;
}

@keyframes memo-operation-complete-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
