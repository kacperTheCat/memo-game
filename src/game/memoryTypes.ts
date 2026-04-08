import type { Difficulty } from '@/game/tileLibraryTypes'

export type TilePhase = 'concealed' | 'revealed' | 'matched'

export interface TileRuntimeState {
  identityIndex: number
  phase: TilePhase
  flipProgress?: number
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
  clickCount: number
  activePlayMs: number
  startedAt: string
  completedAt: string | null
  status: SessionStatus
}

export interface SessionSnapshot {
  schemaVersion: number
  session: GameSession
  cells: TileRuntimeState[]
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
