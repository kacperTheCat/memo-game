import { BOARD_MAX_WIDTH_CSS } from '@/game/canvas/canvasLayout'

/** Shared max-width for game chrome (header + board column) vs `BOARD_MAX_WIDTH_CSS`. */
export function gameShellMaxWidthStyle(): { maxWidth: string } {
  return { maxWidth: `min(100%, ${BOARD_MAX_WIDTH_CSS}px)` }
}
