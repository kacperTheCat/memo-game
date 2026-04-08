<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import BriefcaseGlassPanel from '@/components/briefcase/BriefcaseGlassPanel.vue'
import { useBriefcaseNavigateToGame } from '@/composables/useBriefcaseNavigateToGame'
import { formatMaskedNineDigitsFromRawInput } from '@/composables/useNineDigitSeedMask'
import {
  briefcaseDescription,
  briefcaseDifficultyEasy,
  briefcaseDifficultyEasySubtitle,
  briefcaseDifficultyHard,
  briefcaseDifficultyHardSubtitle,
  briefcaseDifficultyLabel,
  briefcaseDifficultyMedium,
  briefcaseDifficultyMediumSubtitle,
  briefcaseSeedIncompleteMessage,
  briefcaseSeedLabel,
  briefcaseSeedPlaceholder,
  briefcaseTitle,
  briefcaseUnlockShowcase,
} from '@/constants/appCopy'
import { isBriefcaseSeedIncompleteEntry } from '@/game/seedDeal'
import { useGameSettingsStore } from '@/stores/gameSettings'

defineOptions({ name: 'BriefcaseView' })

const gameSettings = useGameSettingsStore()
const { difficulty, briefcaseSeedRaw } = storeToRefs(gameSettings)
const { navigateToGame } = useBriefcaseNavigateToGame()

const seedIncomplete = computed(() =>
  isBriefcaseSeedIncompleteEntry(briefcaseSeedRaw.value),
)

/** FR-005b: error chrome + disabled CTAs only after blur with partial seed. */
const seedShowIncompleteChrome = computed(
  () =>
    seedIncomplete.value && gameSettings.briefcaseSeedIncompleteAfterBlur,
)

const difficultyRadiosName = 'briefcase-difficulty'

const difficultyOptions = [
  {
    value: 'easy' as const,
    label: briefcaseDifficultyEasy,
    subtitle: briefcaseDifficultyEasySubtitle,
  },
  {
    value: 'medium' as const,
    label: briefcaseDifficultyMedium,
    subtitle: briefcaseDifficultyMediumSubtitle,
  },
  {
    value: 'hard' as const,
    label: briefcaseDifficultyHard,
    subtitle: briefcaseDifficultyHardSubtitle,
  },
]

function onSeedInput(ev: Event): void {
  const el = ev.target as HTMLInputElement
  const next = formatMaskedNineDigitsFromRawInput(el.value)
  briefcaseSeedRaw.value = next
  /** Keep DOM in sync when the tenth digit is dropped (FR-005a). */
  if (el.value !== next) {
    el.value = next
  }
  gameSettings.clearBriefcaseSeedIncompleteAfterBlurIfResolved()
}

function onUnlockShowcase(): void {
  navigateToGame()
}
</script>

<template>
  <div class="flex flex-col">
    <BriefcaseGlassPanel>
      <div class="flex flex-col gap-8">
        <!-- Title area — designs/.../the_briefcase_main_menu/code.html -->
        <div class="space-y-2 text-center">
          <h1
            class="text-[32px] font-semibold leading-none tracking-tight text-memo-text md:text-[48px] [text-shadow:0_0_20px_rgba(255,255,255,0.1)]"
          >
            {{ briefcaseTitle }}
          </h1>
          <p class="text-sm text-memo-muted md:text-base">
            {{ briefcaseDescription }}
          </p>
        </div>

        <!-- Difficulty -->
        <div class="space-y-4">
          <fieldset
            data-testid="briefcase-difficulty"
            class="m-0 border-0 p-0"
          >
            <legend
              class="text-[12px] font-medium uppercase tracking-[0.05em] text-memo-muted"
            >
              {{ briefcaseDifficultyLabel }}
            </legend>
            <div
              class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
            >
              <label
                v-for="opt in difficultyOptions"
                :key="opt.value"
                class="memo-radio-card cursor-pointer"
              >
                <input
                  v-model="difficulty"
                  type="radio"
                  class="peer sr-only"
                  :name="difficultyRadiosName"
                  :value="opt.value"
                >
                <div
                  class="flex flex-col rounded-[var(--memo-radius-md)] border border-memo-border bg-white/5 p-4 transition-all duration-200 peer-checked:border-memo-accent peer-checked:shadow-[0_0_15px_rgba(228,168,52,0.2)] peer-checked:[&_.memo-radio-title]:text-memo-accent peer-checked:[&_.memo-radio-indicator]:border-memo-accent peer-checked:[&_.memo-radio-indicator]:bg-memo-accent motion-safe:hover:border-white/20"
                >
                  <div class="mb-2 flex items-center justify-between">
                    <span
                      class="memo-radio-title text-base font-semibold text-memo-text transition-colors"
                    >
                      {{ opt.label }}
                    </span>
                    <div
                      class="memo-radio-indicator h-4 w-4 shrink-0 rounded-full border border-memo-muted transition-colors"
                    />
                  </div>
                  <span class="font-mono text-sm text-memo-muted">
                    {{ opt.subtitle }}
                  </span>
                </div>
              </label>
            </div>
          </fieldset>
        </div>

        <!-- Seed -->
        <div class="space-y-3">
          <label
            class="block text-[12px] font-medium uppercase tracking-[0.05em] text-memo-muted"
            for="briefcase-seed-input"
          >
            {{ briefcaseSeedLabel }}
          </label>
          <input
            id="briefcase-seed-input"
            :value="briefcaseSeedRaw"
            type="text"
            inputmode="numeric"
            name="game-seed"
            autocomplete="off"
            :placeholder="briefcaseSeedPlaceholder"
            data-testid="briefcase-seed-input"
            :aria-invalid="seedShowIncompleteChrome"
            :aria-required="seedShowIncompleteChrome"
            :aria-describedby="
              seedShowIncompleteChrome
                ? 'briefcase-seed-incomplete-hint'
                : undefined
            "
            :class="[
              'w-full rounded-[var(--memo-radius-md)] border bg-black/30 px-4 py-3 text-sm text-memo-text placeholder:text-memo-muted/50 focus:outline-none focus:ring-1',
              seedShowIncompleteChrome
                ? 'border-red-400/70 focus:border-red-400/80 focus:ring-red-400/40'
                : 'border-memo-border focus:border-memo-accent/50 focus:ring-memo-accent/50',
            ]"
            @focus="gameSettings.onBriefcaseSeedFieldFocus()"
            @blur="gameSettings.onBriefcaseSeedFieldBlur()"
            @input="onSeedInput"
          >
          <p
            v-if="seedShowIncompleteChrome"
            id="briefcase-seed-incomplete-hint"
            data-testid="briefcase-seed-incomplete-hint"
            role="alert"
            class="text-sm text-red-300/90"
          >
            {{ briefcaseSeedIncompleteMessage }}
          </p>
        </div>

        <!-- CTA -->
        <div class="pt-2">
          <button
            type="button"
            data-testid="briefcase-unlock-showcase"
            :disabled="seedShowIncompleteChrome"
            class="w-full rounded-[var(--memo-radius-md)] bg-memo-accent px-4 py-4 text-base font-semibold text-memo-cta-text shadow-[0_0_20px_rgb(228_168_52/0.3)] transition-all duration-300 hover:brightness-110 motion-safe:hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-memo-accent/80 focus:ring-offset-2 focus:ring-offset-memo-bg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            @click="onUnlockShowcase"
          >
            {{ briefcaseUnlockShowcase }}
          </button>
        </div>
      </div>
    </BriefcaseGlassPanel>
  </div>
</template>
