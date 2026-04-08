import { useRouter } from 'vue-router'
import { briefcaseUnlockAbandonInProgress } from '@/constants/appCopy'
import {
  isBriefcaseSeedIncompleteEntry,
  parseNineDigitSeedOrNull,
} from '@/game/seedDeal'
import { useGamePlayStore } from '@/stores/gamePlay'
import { useGameSessionStore } from '@/stores/gameSession'
import { useGameSettingsStore } from '@/stores/gameSettings'

/**
 * Start /game from The Briefcase: confirm abandon if an in-progress session’s difficulty
 * differs from the selected preset (hub UX; not FR-014 win-debrief reset).
 */
export function useBriefcaseNavigateToGame() {
  const router = useRouter()
  const session = useGameSessionStore()
  const play = useGamePlayStore()
  const settings = useGameSettingsStore()

  function navigateToGame(): void {
    if (isBriefcaseSeedIncompleteEntry(settings.briefcaseSeedRaw)) {
      return
    }
    const selected = settings.difficulty
    const gs = session.gameSession
    const difficultyMismatch =
      gs?.status === 'in_progress' && gs.difficulty !== selected
    const seedMismatch =
      gs?.status === 'in_progress' &&
      settings.briefcaseSeedRaw !== gs.dealBriefcaseSeedRaw

    if (difficultyMismatch || seedMismatch) {
      if (!window.confirm(briefcaseUnlockAbandonInProgress)) {
        return
      }
      session.finalizeSession('abandoned')
      play.resetRound()
    }
    const seedNine = parseNineDigitSeedOrNull(settings.briefcaseSeedRaw)
    void router.push({
      name: 'game',
      state: { memoDealInit: { seedNine } },
    })
  }

  /** Resume current match: no abandon confirm (007). */
  function resumeToGame(): void {
    void router.push({ name: 'game' })
  }

  return { navigateToGame, resumeToGame }
}
