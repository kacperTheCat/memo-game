import { useRouter } from 'vue-router'
import { briefcaseUnlockAbandonDifferentDifficulty } from '@/constants/appCopy'
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
    const selected = settings.difficulty
    const gs = session.gameSession
    if (gs?.status === 'in_progress' && gs.difficulty !== selected) {
      if (!window.confirm(briefcaseUnlockAbandonDifferentDifficulty)) {
        return
      }
      session.finalizeSession('abandoned')
      play.resetRound()
    }
    void router.push({ name: 'game' })
  }

  return { navigateToGame }
}
