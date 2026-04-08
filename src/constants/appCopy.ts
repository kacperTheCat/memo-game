/** Single source of truth for visible English copy (spec FR-004 / FR-008 / FR-009). */
export const documentTitle = 'CS2 Memory'
export const primaryHeading = 'CS2 Memory'
export const homeTagline = 'Counter-Strike 2 themed memory game - setup milestone'

export const navToGame = 'Play'
export const navToBriefcase = 'The Briefcase'
export const navToHome = 'Home'

export const gamePageHeading = 'Memory game'
export const gamePageSubline =
  'Display-only tile grid from The Briefcase difficulty (no match play yet).'

export const briefcaseTitle = 'The Briefcase'
/** Main Menu glass title subline — matches `the_briefcase_main_menu/code.html`. */
export const briefcaseDescription = 'Configure match parameters'
export const briefcaseSeedLabel = 'Seed'
export const briefcaseSeedPlaceholder =
  'Optional — nine digits, same deal every time (xxx-xxx-xxx)'

/** Shown when the field has 1–8 digits: must complete nine or clear to continue. */
export const briefcaseSeedIncompleteMessage =
  'Enter all nine digits to use a seed, or clear the field to play without one.'

/** Difficulty block heading — matches export `Select Difficulty` (fieldset legend). */
export const briefcaseDifficultyLabel = 'Select Difficulty'
export const briefcaseDifficultyEasy = 'Easy'
export const briefcaseDifficultyMedium = 'Medium'
export const briefcaseDifficultyHard = 'Hard'
/** Subtitles under each tile — aligned to Main Menu export grid hints (FR-010a). */
export const briefcaseDifficultyEasySubtitle = '4x4 Grid'
export const briefcaseDifficultyMediumSubtitle = '6x6 Grid'
export const briefcaseDifficultyHardSubtitle = '8x8 Grid'
export const briefcaseUnlockShowcase = 'Unlock showcase'

/**
 * Shown when Briefcase → /game would abandon an in-progress round because **difficulty** and/or
 * **Briefcase seed field** no longer match the session that started the current game (**FR-014** / **FR-006a**).
 */
export const briefcaseUnlockAbandonInProgress =
  'You have a game in progress that does not match your current Briefcase settings (difficulty or seed). Continue to abandon it and start with your selection? A record will be saved for statistics (outcome: abandoned).'

/** @deprecated Use `briefcaseUnlockAbandonInProgress` (same string; kept for spec / doc grep parity). */
export const briefcaseUnlockAbandonDifferentDifficulty =
  briefcaseUnlockAbandonInProgress
