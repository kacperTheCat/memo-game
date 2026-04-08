import { defineStore } from 'pinia'
import { isBriefcaseSeedIncompleteEntry } from '@/game/seedDeal'
import type { Difficulty } from '@/game/tileLibraryTypes'

export const useGameSettingsStore = defineStore('gameSettings', {
  state: () => ({
    /** Synced with The Briefcase difficulty radios; default for direct `/game` visits. */
    difficulty: 'medium' as Difficulty,
    /** Briefcase seed field (masked `xxx-xxx-xxx` once US3 lands); shared by Unlock + header Play. */
    briefcaseSeedRaw: '',
    /**
     * After the seed field **blur**s with **1–8** digits (FR-005b). Cleared on **focus** or when
     * the value is no longer an incomplete entry.
     */
    briefcaseSeedIncompleteAfterBlur: false,
    /**
     * One-shot optional seed for the next `startNewRound` shuffle (Briefcase input or `?seed=`).
     * Consumed when a new deal is dealt.
     */
    dealSeed: null as string | null,
  }),
  actions: {
    onBriefcaseSeedFieldFocus() {
      this.briefcaseSeedIncompleteAfterBlur = false
    },
    onBriefcaseSeedFieldBlur() {
      this.briefcaseSeedIncompleteAfterBlur = isBriefcaseSeedIncompleteEntry(
        this.briefcaseSeedRaw,
      )
    },
    clearBriefcaseSeedIncompleteAfterBlurIfResolved() {
      if (!isBriefcaseSeedIncompleteEntry(this.briefcaseSeedRaw)) {
        this.briefcaseSeedIncompleteAfterBlur = false
      }
    },
  },
})
