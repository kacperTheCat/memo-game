import type { Difficulty } from '@/game/library/tileLibraryTypes'

export type TilePhase = 'concealed' | 'revealed' | 'matched'

export interface TileRuntimeState {
  identityIndex: number
  phase: TilePhase
  /** Ephemeral; never persist to SessionSnapshot. */
  flipProgress?: number
}

/** Persisted cell shape — animation fields stripped in `buildSnapshot`. */
export interface SnapshotTileCell {
  identityIndex: number
  phase: TilePhase
}

export interface PairResolutionState {
  firstIndex: number | null
  secondIndex: number | null
  locked: boolean
}

export type SessionStatus = 'in_progress' | 'won' | 'abandoned'

export interface GameSession {
  sessionId: string
  difficulty: Difficulty
  /** Briefcase seed field snapshot when this in-progress round began (`''` if not from Briefcase). */
  dealBriefcaseSeedRaw: string
  clickCount: number
  activePlayMs: number
  startedAt: string
  completedAt: string | null
  status: SessionStatus
}

export interface SessionSnapshot {
  schemaVersion: number
  session: GameSession
  cells: SnapshotTileCell[]
  pair: PairResolutionState
}

export type CompletedOutcome = 'won' | 'abandoned'

export interface CompletedSessionRecord {
  sessionId: string
  difficulty: Difficulty
  clickCount: number
  activePlayMs: number
  completedAt: string
  outcome: CompletedOutcome
}
