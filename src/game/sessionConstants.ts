/** Keys for `localStorage` — see `specs/004-game-core-logic/contracts/README.md`. */
export const STORAGE_IN_PROGRESS_KEY = 'memo-game.v1.inProgress'
export const STORAGE_COMPLETED_SESSIONS_KEY = 'memo-game.v1.completedSessions'

/** Cap completed rows to reduce quota risk (`data-model.md`). */
export const COMPLETED_SESSIONS_MAX = 200
