import { defineStore } from 'pinia'
import type { Difficulty } from '@/game/tileLibraryTypes'

export const useGameSettingsStore = defineStore('gameSettings', {
  state: () => ({
    /** Synced with The Briefcase difficulty radios; default for direct `/game` visits. */
    difficulty: 'medium' as Difficulty,
  }),
})
