/// <reference types="vite/client" />

import 'vue-router'

declare module 'vue-router' {
  interface HistoryState {
    memoDealInit?: { seedNine: string | null }
  }
}
