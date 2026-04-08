import { defineStore } from 'pinia'
import type { Difficulty } from '@/game/tileLibraryTypes'

export const useGameSettingsStore = defineStore('gameSettings', {
  state: () => ({
    /** Synced with The Briefcase difficulty radios; default for direct `/game` visits. */
    difficulty: 'medium' as Difficulty,
    /**
     * One-shot optional seed for the next `startNewRound` shuffle (Briefcase input or `?seed=`).
     * Consumed when a new deal is dealt.
     */
    dealSeed: null as string | null,
  }),
})
