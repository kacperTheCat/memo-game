import { useRouter } from 'vue-router'
import {
  briefcaseUnlockAbandonInProgress,
  briefcaseUnlockSameSettingsNewDeal,
} from '@/constants/appCopy'
import {
  isBriefcaseSeedIncompleteEntry,
  parseNineDigitSeedOrNull,
} from '@/game/seed/seedDeal'
import { useGamePlayStore } from '@/stores/game/gamePlay'
import { useGameSessionStore } from '@/stores/game/gameSession'
import { useGameSettingsStore } from '@/stores/game/gameSettings'

export type BriefcaseRequestConfirm = (message: string) => Promise<boolean>

/**
 * Start `/game` from The Briefcase (**Unlock showcase**).
 *
 * **FR-002 / spec 009:** If a session is **in_progress**, always **`requestConfirm`** before navigating—
 * whether Briefcase settings match or mismatch the session—so **Unlock** means a deliberate **new** deal,
 * not silent resume. **`resumeToGame`** (Return to Game) does not use this path.
 */
export function useBriefcaseNavigateToGame(requestConfirm: BriefcaseRequestConfirm) {
  const router = useRouter()
  const session = useGameSessionStore()
  const play = useGamePlayStore()
  const settings = useGameSettingsStore()

  async function navigateToGame(): Promise<void> {
    if (isBriefcaseSeedIncompleteEntry(settings.briefcaseSeedRaw)) {
      return
    }
    const gs = session.gameSession
    if (gs?.status === 'in_progress') {
      const difficultyMismatch = gs.difficulty !== settings.difficulty
      const seedMismatch = settings.briefcaseSeedRaw !== gs.dealBriefcaseSeedRaw
      const mismatch = difficultyMismatch || seedMismatch
      const message = mismatch
        ? briefcaseUnlockAbandonInProgress
        : briefcaseUnlockSameSettingsNewDeal
      const ok = await requestConfirm(message)
      if (!ok) {
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
