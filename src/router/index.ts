import { createRouter, createWebHistory } from 'vue-router'
import { clearReloadNewGameDifficulty } from '@/game/reloadNewGameDifficulty'
import { useGamePlayStore } from '@/stores/gamePlay'
import { useGameSessionStore } from '@/stores/gameSession'
import BriefcaseViewPage from '@/views/BriefcaseViewPage.vue'
import GameView from '@/views/GameView.vue'
import HomeView from '@/views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/game', name: 'game', component: GameView },
    { path: '/briefcase', name: 'briefcase', component: BriefcaseViewPage },
  ],
})

/** FR-014: entering briefcase clears won debrief state (Pinia survives route changes). */
router.beforeEach((to) => {
  if (to.name !== 'briefcase') {
    return
  }
  const sessionStore = useGameSessionStore()
  const playStore = useGamePlayStore()
  if (sessionStore.gameSession?.status === 'won') {
    clearReloadNewGameDifficulty()
    sessionStore.clearSession()
    playStore.resetRound()
  }
})
