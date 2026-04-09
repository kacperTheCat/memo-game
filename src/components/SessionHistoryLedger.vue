<script setup lang="ts">
import { computed } from 'vue'
import type { Difficulty } from '@/game/tileLibraryTypes'
import type { CompletedSessionRecord } from '@/game/memoryTypes'
import {
  difficultyDisplayLabel,
  formatActivePlayMsAsMmSs,
  formatCompletedAtDateLocalYyyyMmDd,
} from '@/game/winDebriefFormat'
import { filterWonSessionsNewestFirst } from '@/game/winDebriefHistory'
import { useGameSessionStore } from '@/stores/gameSession'

defineOptions({ name: 'SessionHistoryLedger' })

withDefaults(
  defineProps<{
    /** When true, show the debrief-style section header. */
    showSectionHeader?: boolean
  }>(),
  { showSectionHeader: true },
)

const session = useGameSessionStore()

const historyRows = computed((): CompletedSessionRecord[] =>
  filterWonSessionsNewestFirst(session.readCompletedList()),
)

function chipClass(d: Difficulty): string {
  switch (d) {
    case 'hard':
      return 'border border-red-500/20 bg-red-500/10 text-red-400'
    case 'medium':
      return 'border border-purple-500/20 bg-purple-500/10 text-purple-400'
    default:
      return 'border border-blue-500/20 bg-blue-500/10 text-blue-400'
  }
}
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <div
      v-if="showSectionHeader"
      class="flex items-center justify-between"
    >
      <h3 class="text-xl font-semibold text-white">
        History Ledger
      </h3>
      <span class="font-mono text-xs uppercase tracking-widest text-gray-500">Local Data</span>
    </div>
    <div class="ledger-glass overflow-hidden rounded-2xl">
      <!-- min-height stabilizes cross-OS table metrics (Linux vs macOS) for Playwright screenshots -->
      <div
        class="w-full min-h-[184px] overflow-x-auto"
        data-testid="session-history-table-wrap"
      >
        <table
          data-testid="session-history-table"
          class="w-full whitespace-nowrap text-left"
        >
          <thead>
            <tr class="border-b border-white/10 bg-black/40">
              <th class="px-6 py-4 text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                Date
              </th>
              <th class="px-6 py-4 text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                Difficulty
              </th>
              <th class="px-6 py-4 text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                Time
              </th>
              <th class="px-6 py-4 text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                Moves
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <template v-if="historyRows.length === 0">
              <tr>
                <td
                  colspan="4"
                  class="px-6 py-12 text-center text-sm text-gray-500"
                >
                  <span data-testid="session-history-empty">No operational data found.</span>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="(row, idx) in historyRows"
                :key="row.sessionId + row.completedAt"
                class="transition-colors hover:bg-white/[0.02]"
                :class="{ 'bg-white/[0.01]': idx % 2 === 1 }"
              >
                <td class="px-6 py-5 font-mono text-sm text-gray-300">
                  {{ formatCompletedAtDateLocalYyyyMmDd(row.completedAt) }}
                </td>
                <td class="px-6 py-5">
                  <span
                    class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium"
                    :class="chipClass(row.difficulty)"
                  >
                    {{ difficultyDisplayLabel(row.difficulty) }}
                  </span>
                </td>
                <td class="px-6 py-5 font-mono text-sm font-medium text-white">
                  {{ formatActivePlayMsAsMmSs(row.activePlayMs) }}
                </td>
                <td class="px-6 py-5 font-mono text-sm font-medium text-gray-300">
                  {{ row.clickCount }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ledger-glass {
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
