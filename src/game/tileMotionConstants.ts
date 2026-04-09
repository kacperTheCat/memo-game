/** Wrong-pair shake phase duration (must match `gamePlay` store). */
export const TILE_MISMATCH_SHAKE_MS = 420

/** Wrong-pair flip-back to concealed duration. */
export const TILE_MISMATCH_FLIP_BACK_MS = 280

/** Total mismatch resolution = shake + flip-back (must match `gamePlay` store). */
export const MISMATCH_RESOLVE_MS = TILE_MISMATCH_SHAKE_MS + TILE_MISMATCH_FLIP_BACK_MS

/** Reveal flip (concealed → face) duration. */
export const TILE_FLIP_MS = 280

/** Matched pair collect flight into strip (replaces fade-out). */
export const TILE_COLLECT_MS = 520

/** Legacy: matched cells skip grid draw immediately; collect handles motion. */
export const TILE_MATCH_FADE_MS = 0

/** Max horizontal shake offset for mismatch (px, CSS space). */
export const TILE_SHAKE_PX_MAX = 7
