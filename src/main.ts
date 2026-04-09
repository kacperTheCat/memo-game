import { createApp } from 'vue'
import App from './App.vue'
import {
  hydrateGameSettingsFromStorage,
  persistPlayerSettingsFromStore,
  subscribeDebouncedPlayerSettingsPersistence,
} from '@/game/playerSettingsStorage'
import { useGameSettingsStore } from '@/stores/gameSettings'
import { router } from './router'
import { pinia } from './stores'
import './style.css'

const app = createApp(App)
app.use(pinia)
hydrateGameSettingsFromStorage(pinia)
subscribeDebouncedPlayerSettingsPersistence(pinia)

function flushPlayerSettingsForUnload(): void {
  persistPlayerSettingsFromStore(useGameSettingsStore(pinia))
}

window.addEventListener('pagehide', flushPlayerSettingsForUnload)
window.addEventListener('beforeunload', flushPlayerSettingsForUnload)

app.use(router)
app.mount('#app')
