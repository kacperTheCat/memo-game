/** Keys for `localStorage` — see `specs/004-game-core-logic/contracts/README.md`. */
export const STORAGE_IN_PROGRESS_KEY = 'memo-game.v1.inProgress'
export const STORAGE_COMPLETED_SESSIONS_KEY = 'memo-game.v1.completedSessions'

/** See `specs/012-pwa-offline-install/contracts/README.md`. */
export const STORAGE_PLAYER_SETTINGS_KEY = 'memo-game.v1.playerSettings'
export const STORAGE_PWA_INSTALL_UI_KEY = 'memo-game.v1.pwaInstallUi'
/** Once per browser tab: install sheet was shown (avoids localStorage `seen` blocking `prompt()` after refresh). */
export const SESSION_STORAGE_PWA_INSTALL_SHEET_OFFERED_KEY =
  'memo-game.v1.pwaInstallSheetOffered'

/** Cap completed rows to reduce quota risk (`data-model.md`). */
export const COMPLETED_SESSIONS_MAX = 200
