import { createRouter, createWebHistory } from 'vue-router'
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
