<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import rawLibrary from '@/data/tile-library.json'
import { buildGridCells, gridDimensions } from '@/game/canvas/buildGridLayout'
import { historyStateWithoutMemoDeal } from '@/game/seed/dealInitFromNavigation'
import { createCanvasShellImageCache } from '@/game/canvas/canvasShellAssets'
import { cellRectsForGrid, type CellRect } from '@/game/canvas/cellRect'
import { normalizedPointerInFaceRect } from '@/game/tiles/tileFaceGradientPointer'
import { cellIndexFromPointer } from '@/game/canvas/canvasHitTest'
import { easeOutCubic } from '@/game/animation/animationEasing'
import {
  BOARD_CANVAS_INSET_PX,
  BOARD_GAP_PX,
  BOARD_MAX_WIDTH_CSS,
  boardStripLayout,
} from '@/game/canvas/canvasLayout'
import {
  lerpCollectRect,
  stripChipRect,
} from '@/game/tiles/collectStripLayout'
import { drawTile } from '@/game/canvas/canvasTileDraw'
import type { TilePhase } from '@/game/memory/memoryTypes'
import { isWrongPairPending } from '@/game/memory/memoryEngine'
import {
  TILE_COLLECT_MS,
  TILE_FLIP_MS,
  TILE_MATCH_FADE_MS,
  TILE_MISMATCH_FLIP_BACK_MS,
  TILE_MISMATCH_SHAKE_MS,
  TILE_SHAKE_PX_MAX,
} from '@/game/tiles/tileMotionConstants'
import { parallaxOffset } from '@/game/tiles/tileParallax'
import {
  smoothParallaxOffsets,
  staggerFactor,
} from '@/game/tiles/tileParallaxSmooth'
import { startNewRoundFromBriefcaseNavigation } from '@/game/memory/gameCanvasFreshDeal'
import { consumeReloadNewGameDifficulty } from '@/game/storage/reloadNewGameDifficulty'
import { createSeededRandom } from '@/game/seed/seededRng'
import {
  cloneMemoryStateShallow,
  sfxOutcomesForPick,
} from '@/game/memory/sfxPickOutcomes'
import type { Difficulty, TileEntry, TileLibraryFile } from '@/game/library/tileLibraryTypes'
import { ensureSfxAudioUnlocked, playSfx, playUiClick } from '@/audio/gameSfx'
import { showGameDebugPeekUi } from '@/env/showGameDebugPeekUi'
import { useGamePlayStore } from '@/stores/game/gamePlay'
import { useGameSessionStore } from '@/stores/game/gameSession'
import { useGameSettingsStore } from '@/stores/game/gameSettings'

defineOptions({ name: 'GameCanvasShell' })

const emit = defineEmits<{ won: [] }>()

function takeDealRng(): () => number {
  const s = settings.dealSeed
  if (s) {
    settings.dealSeed = null
    return createSeededRandom(s)
  }
  return Math.random
}

const lib = rawLibrary as TileLibraryFile
const entries = lib.entries

const shellRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const settings = useGameSettingsStore()
const play = useGamePlayStore()
const session = useGameSessionStore()
const route = useRoute()
const router = useRouter()

const pointerCss = ref<{ x: number; y: number } | null>(null)
const reducedMotion = ref(false)

/** Dev-only: paint all tile faces (concealed + matched) as revealed for asset inspection. */
const debugPeekAllFaces = ref(false)
const showDebugPeekButton = showGameDebugPeekUi()

function onDebugPeekToggle(): void {
  playUiClick()
  debugPeekAllFaces.value = !debugPeekAllFaces.value
}

function drawPhaseForCanvas(cellPhase: TilePhase, peekAll: boolean): TilePhase {
  if (!peekAll) {
    return cellPhase
  }
  if (cellPhase === 'concealed' || cellPhase === 'matched') {
    return 'revealed'
  }
  return cellPhase
}

const layout = computed(() => buildGridCells(entries, settings.difficulty))

/** Paint and hit-test must use the same grid as `play.memory`; `settings` can lag until synced from snapshot. */
const gridRows = computed(() => (play.memory ? play.rows : layout.value.rows))
const gridCols = computed(() => (play.memory ? play.cols : layout.value.cols))

const rowsAttr = computed(() => String(gridRows.value))
const colsAttr = computed(() => String(gridCols.value))
const cellsAttr = computed(() =>
  String(play.memory ? play.memory.cells.length : layout.value.totalCells),
)

const revealedCount = computed(() => {
  const m = play.memory
  if (!m) {
    return 0
  }
  return m.cells.filter((c) => c.phase === 'revealed').length
})

const matchedCount = computed(() => {
  const m = play.memory
  if (!m) {
    return 0
  }
  return m.cells.filter((c) => c.phase === 'matched').length
})

const identityOrderAttr = computed(() =>
  play.memory ? play.memory.cells.map((c) => c.identityIndex).join(',') : '',
)

const ariaBoard = computed(() => {
  return `Memory game board, ${gridRows.value} by ${gridCols.value} tile grid`
})

const initialIdentitiesJson = computed(() => {
  const m = play.memory
  if (!m) {
    return ''
  }
  return JSON.stringify(m.cells.map((c) => c.identityIndex))
})

async function stripMemoDealFromHistory(): Promise<void> {
  await router.replace({
    path: route.fullPath,
    state: historyStateWithoutMemoDeal(window.history.state),
  })
}

const { imageCache, ensureImage } = createCanvasShellImageCache(
  () => import.meta.env.BASE_URL,
)

function entryForIdentityInDeal(identityIndex: number): TileEntry {
  const m = play.memory
  const n =
    m && m.cells.length > 0
      ? m.cells.length / 2
      : gridDimensions(settings.difficulty).n
  const e = entries[identityIndex]
  if (!e || identityIndex < 0 || identityIndex >= n) {
    return entries[0]!
  }
  return e
}

let raf = 0
let observer: ResizeObserver | null = null
let lastPaintMs = performance.now()
let mismatchStartedAt: number | null = null
let lastDealSig = ''
/** Bumps when the deal identity set changes so stale image-load callbacks ignore. */
let tileLoadEpoch = 0
let lastTileLoadKickEpoch = -1

const shellAssetsPending = ref(false)
const tileImagesLoadFailed = ref(false)

interface CollectFlightState {
  a: number
  b: number
  identityIndex: number
  t: number
  fromA: CellRect
  fromB: CellRect
}

let collectFlight: CollectFlightState | null = null
const collectQueue: Omit<CollectFlightState, 't'>[] = []

const stripChips = ref<{ identityIndex: number }[]>([])
const mismatchPhaseUi = ref<'idle' | 'shake' | 'flip_back'>('idle')

/** Ephemeral animation buffers (not persisted). */
const reveal01: number[] = []
const matchFade01: number[] = []
const prevPhases: TilePhase[] = []
const parallaxSm: { ox: number; oy: number }[] = []
const highlightSmNx: number[] = []
const highlightSmNy: number[] = []

const HIGHLIGHT_SMOOTH_TAU_MS = 95

function resizeAnimBuffers(n: number): void {
  while (reveal01.length < n) {
    reveal01.push(1)
    matchFade01.push(0)
    prevPhases.push('concealed')
    parallaxSm.push({ ox: 0, oy: 0 })
    highlightSmNx.push(0.5)
    highlightSmNy.push(0.5)
  }
  reveal01.length = n
  matchFade01.length = n
  prevPhases.length = n
  parallaxSm.length = n
  highlightSmNx.length = n
  highlightSmNy.length = n
}

function seedAnimFromMemory(mem: { cells: { phase: TilePhase }[] }): void {
  const n = mem.cells.length
  resizeAnimBuffers(n)
  for (let i = 0; i < n; i++) {
    const ph = mem.cells[i]!.phase
    prevPhases[i] = ph
    reveal01[i] = ph === 'concealed' ? 1 : 1
    matchFade01[i] = ph === 'matched' ? 1 : 0
    highlightSmNx[i] = 0.5
    highlightSmNy[i] = 0.5
  }
}

function stripChipsFromMemory(mem: {
  cells: { phase: TilePhase; identityIndex: number }[]
}): { identityIndex: number }[] {
  const seen = new Set<number>()
  const out: { identityIndex: number }[] = []
  for (const c of mem.cells) {
    if (c.phase === 'matched' && !seen.has(c.identityIndex)) {
      seen.add(c.identityIndex)
      out.push({ identityIndex: c.identityIndex })
    }
  }
  return out
}

function syncAnimEdges(mem: {
  cells: { phase: TilePhase }[]
}): number[] {
  const newlyMatched: number[] = []
  const n = mem.cells.length
  for (let i = 0; i < n; i++) {
    const phase = mem.cells[i]!.phase
    const prev = prevPhases[i]
    if (prev === 'concealed' && phase === 'revealed') {
      reveal01[i] = 0
    }
    if (prev !== 'matched' && phase === 'matched') {
      matchFade01[i] = 1
      newlyMatched.push(i)
    }
    prevPhases[i] = phase
  }
  return newlyMatched
}

function advanceAnim(
  mem: { cells: { phase: TilePhase }[] },
  dt: number,
): boolean {
  let active = false
  const n = mem.cells.length
  for (let i = 0; i < n; i++) {
    const ph = mem.cells[i]!.phase
    if (ph === 'revealed' || ph === 'matched') {
      if (reveal01[i]! < 1) {
        reveal01[i] = Math.min(1, reveal01[i]! + dt / TILE_FLIP_MS)
        active = true
      }
    }
    if (
      ph === 'matched' &&
      matchFade01[i]! < 1 &&
      TILE_MATCH_FADE_MS > 0
    ) {
      matchFade01[i] = Math.min(1, matchFade01[i]! + dt / TILE_MATCH_FADE_MS)
      active = true
    }
  }
  return active
}

function mismatchShake(now: number, mem: typeof play.memory): number {
  if (!mem || reducedMotion.value) {
    return 0
  }
  const { firstIndex, secondIndex } = mem.pair
  if (!isWrongPairPending(mem) || firstIndex === null || secondIndex === null) {
    mismatchStartedAt = null
    return 0
  }
  const a = mem.cells[firstIndex]
  const b = mem.cells[secondIndex]
  if (!a || !b) {
    mismatchStartedAt = null
    return 0
  }
  if (mismatchStartedAt === null) {
    mismatchStartedAt = now
  }
  const t = now - mismatchStartedAt
  if (t >= TILE_MISMATCH_SHAKE_MS) {
    return 0
  }
  const env = 1 - easeOutCubic(Math.min(1, t / TILE_MISMATCH_SHAKE_MS))
  return Math.sin(t * 0.022) * TILE_SHAKE_PX_MAX * env
}

function mismatchConceal01ForCell(
  now: number,
  mem: typeof play.memory,
  cellIndex: number,
): number | undefined {
  if (!mem) {
    return undefined
  }
  const { firstIndex, secondIndex } = mem.pair
  if (!isWrongPairPending(mem) || firstIndex === null || secondIndex === null) {
    return undefined
  }
  if (cellIndex !== firstIndex && cellIndex !== secondIndex) {
    return undefined
  }
  const a = mem.cells[firstIndex]
  const b = mem.cells[secondIndex]
  if (!a || !b) {
    return undefined
  }
  if (reducedMotion.value) {
    return 1
  }
  if (mismatchStartedAt === null) {
    return undefined
  }
  const elapsed = now - mismatchStartedAt
  if (elapsed < TILE_MISMATCH_SHAKE_MS) {
    return undefined
  }
  return Math.min(
    1,
    (elapsed - TILE_MISMATCH_SHAKE_MS) / TILE_MISMATCH_FLIP_BACK_MS,
  )
}

function computeMismatchPhaseUi(
  now: number,
  mem: typeof play.memory,
): 'idle' | 'shake' | 'flip_back' {
  if (!mem) {
    return 'idle'
  }
  const { firstIndex, secondIndex } = mem.pair
  if (!isWrongPairPending(mem) || firstIndex === null || secondIndex === null) {
    return 'idle'
  }
  const a = mem.cells[firstIndex]
  const b = mem.cells[secondIndex]
  if (!a || !b) {
    return 'idle'
  }
  if (reducedMotion.value) {
    return 'flip_back'
  }
  if (mismatchStartedAt === null) {
    return 'shake'
  }
  const elapsed = now - mismatchStartedAt
  if (elapsed < TILE_MISMATCH_SHAKE_MS) {
    return 'shake'
  }
  return 'flip_back'
}

function animationActive(
  mem: typeof play.memory,
  parallaxSettling: boolean,
): boolean {
  if (!mem) {
    return false
  }
  if (parallaxSettling) {
    return true
  }
  const n = mem.cells.length
  for (let i = 0; i < n; i++) {
    const ph = mem.cells[i]!.phase
    if ((ph === 'revealed' || ph === 'matched') && reveal01[i]! < 0.999) {
      return true
    }
    if (ph === 'matched' && matchFade01[i]! < 0.999) {
      return true
    }
  }
  const { firstIndex, secondIndex } = mem.pair
  if (
    isWrongPairPending(mem) &&
    firstIndex !== null &&
    secondIndex !== null
  ) {
    return true
  }
  if (collectFlight !== null) {
    return true
  }
  return false
}

function updatePointerCss(ev: MouseEvent | TouchEvent): void {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }
  const rect = canvas.getBoundingClientRect()
  let cx: number
  let cy: number
  if (ev instanceof TouchEvent) {
    const t = ev.touches[0] ?? ev.changedTouches[0]
    if (!t) {
      return
    }
    cx = t.clientX - rect.left
    cy = t.clientY - rect.top
  } else {
    cx = ev.clientX - rect.left
    cy = ev.clientY - rect.top
  }
  pointerCss.value = { x: cx, y: cy }
}

function onShellPointerMove(ev: MouseEvent | TouchEvent): void {
  updatePointerCss(ev)
  schedulePaint()
}

function faceHighlightForRect(r: CellRect): { nx: number; ny: number } | null {
  if (reducedMotion.value) {
    return null
  }
  if (!pointerCss.value) {
    return { nx: 0.5, ny: 0.5 }
  }
  return normalizedPointerInFaceRect(
    pointerCss.value.x,
    pointerCss.value.y,
    r,
  )
}

function onCanvasPick(ev: MouseEvent | TouchEvent): void {
  const canvas = canvasRef.value
  if (!canvas || !play.memory) {
    return
  }
  updatePointerCss(ev)
  let clientX: number
  let clientY: number
  if (ev instanceof TouchEvent) {
    const t = ev.changedTouches[0] ?? ev.touches[0]
    if (!t) {
      return
    }
    clientX = t.clientX
    clientY = t.clientY
  } else {
    clientX = ev.clientX
    clientY = ev.clientY
  }

  const idx = cellIndexFromPointer(
    canvas,
    clientX,
    clientY,
    gridRows.value,
    gridCols.value,
    BOARD_GAP_PX,
  )
  if (idx === null) {
    return
  }

  void ensureSfxAudioUnlocked()
  const memBefore =
    play.memory !== null ? cloneMemoryStateShallow(play.memory) : null
  const { accepted, won } = play.tryPick(idx)
  const memAfter = play.memory
  if (accepted && memBefore && memAfter) {
    const { flip, success } = sfxOutcomesForPick(memBefore, memAfter, idx)
    if (flip) {
      playSfx('flip')
    }
    if (success) {
      playSfx('success')
    }
  }
  if (accepted) {
    session.incrementClick()
  }
  if (won) {
    playSfx('winRandom')
    session.finalizeSession('won')
    emit('won')
  }
  session.flushSave(play.memory)
  schedulePaint()
}

async function paint(): Promise<void> {
  await nextTick()
  const canvas = canvasRef.value
  const wrap = shellRef.value
  if (!canvas || !wrap) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const now = performance.now()
  const dt = Math.min(64, Math.max(0, now - lastPaintMs))
  lastPaintMs = now

  const rect = wrap.getBoundingClientRect()
  const cssW = Math.max(1, rect.width)
  const cssH = Math.max(1, rect.height)
  const dpr = window.devicePixelRatio || 1

  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, cssW, cssH)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, cssW, cssH)

  const mem = play.memory
  if (!mem) {
    return
  }

  const rows = gridRows.value
  const cols = gridCols.value
  const bs = boardStripLayout(cssW, cssH)
  ctx.fillStyle = '#0c1329'
  ctx.fillRect(0, bs.stripY, cssW, bs.stripH)
  const { rects } = cellRectsForGrid(
    cssW,
    bs.boardH,
    rows,
    cols,
    BOARD_GAP_PX,
    BOARD_CANVAS_INSET_PX,
  )
  const n = mem.cells.length

  const dealSig = mem.cells.map((c) => c.identityIndex).join(',')
  if (dealSig !== lastDealSig) {
    lastDealSig = dealSig
    tileLoadEpoch++
    lastTileLoadKickEpoch = -1
    tileImagesLoadFailed.value = false
    seedAnimFromMemory(mem)
    mismatchStartedAt = null
    collectFlight = null
    collectQueue.length = 0
    stripChips.value = stripChipsFromMemory(mem)
  } else {
    const newlyMatched = syncAnimEdges(mem)
    if (newlyMatched.length === 2) {
      const [i0, i1] = [...newlyMatched].sort((x, y) => x - y)
      const id0 = mem.cells[i0]!.identityIndex
      const id1 = mem.cells[i1]!.identityIndex
      if (id0 === id1) {
        const ra = rects[i0]
        const rb = rects[i1]
        if (ra && rb) {
          if (reducedMotion.value) {
            stripChips.value.push({ identityIndex: id0 })
          } else {
            const payload: Omit<CollectFlightState, 't'> = {
              a: i0,
              b: i1,
              identityIndex: id0,
              fromA: ra,
              fromB: rb,
            }
            if (collectFlight) {
              collectQueue.push(payload)
            } else {
              collectFlight = { ...payload, t: 0 }
            }
          }
        }
      }
    }
  }

  if (collectFlight && !reducedMotion.value) {
    collectFlight.t += dt / TILE_COLLECT_MS
    if (collectFlight.t >= 1) {
      stripChips.value.push({ identityIndex: collectFlight.identityIndex })
      collectFlight = null
      const next = collectQueue.shift()
      if (next) {
        collectFlight = { ...next, t: 0 }
      }
    }
  }

  const shakeBase = mismatchShake(now, mem)
  const animAdvancing = advanceAnim(mem, dt)

  const targets: { ox: number; oy: number }[] = []
  let parallaxEpsilon = 0
  for (let i = 0; i < n; i++) {
    const r = rects[i]
    if (!r) {
      targets.push({ ox: 0, oy: 0 })
      continue
    }
    if (pointerCss.value && !reducedMotion.value) {
      const cx = r.x + r.w / 2
      const cy = r.y + r.h / 2
      const p = parallaxOffset(
        pointerCss.value.x,
        pointerCss.value.y,
        cx,
        cy,
      )
      const g = staggerFactor(i, cols)
      targets.push({ ox: p.ox * g, oy: p.oy * g })
    } else {
      targets.push({ ox: 0, oy: 0 })
    }
  }
  const nextSm = smoothParallaxOffsets(parallaxSm, targets, dt)
  for (let i = 0; i < n; i++) {
    parallaxSm[i] = nextSm[i] ?? { ox: 0, oy: 0 }
    const t = targets[i] ?? { ox: 0, oy: 0 }
    const s = parallaxSm[i]!
    parallaxEpsilon = Math.max(
      parallaxEpsilon,
      Math.hypot(t.ox - s.ox, t.oy - s.oy),
    )
  }
  const parallaxSettling = parallaxEpsilon > 0.08 && !reducedMotion.value

  const highlightSmoothK = 1 - Math.exp(-dt / HIGHLIGHT_SMOOTH_TAU_MS)
  let highlightSettling = false
  for (let i = 0; i < n; i++) {
    const cell = mem.cells[i]
    const r = rects[i]
    if (!cell || !r) {
      continue
    }
    const faceActive =
      cell.phase === 'revealed' ||
      cell.phase === 'matched' ||
      debugPeekAllFaces.value
    if (reducedMotion.value || !faceActive) {
      highlightSmNx[i] = 0.5 + (0.5 - highlightSmNx[i]!) * highlightSmoothK
      highlightSmNy[i] = 0.5 + (0.5 - highlightSmNy[i]!) * highlightSmoothK
      continue
    }
    if (pointerCss.value) {
      const { nx, ny } = normalizedPointerInFaceRect(
        pointerCss.value.x,
        pointerCss.value.y,
        r,
      )
      highlightSmNx[i] += (nx - highlightSmNx[i]!) * highlightSmoothK
      highlightSmNy[i] += (ny - highlightSmNy[i]!) * highlightSmoothK
      if (
        Math.abs((highlightSmNx[i] ?? 0.5) - nx) > 0.014 ||
        Math.abs((highlightSmNy[i] ?? 0.5) - ny) > 0.014
      ) {
        highlightSettling = true
      }
    } else {
      highlightSmNx[i] += (0.5 - highlightSmNx[i]!) * highlightSmoothK
      highlightSmNy[i] += (0.5 - highlightSmNy[i]!) * highlightSmoothK
    }
  }

  const paths = new Set<string>()
  for (const c of mem.cells) {
    paths.add(entryForIdentityInDeal(c.identityIndex).imagePath)
  }
  const pathsArr = [...paths]
  const allImagesCached =
    pathsArr.length === 0 ||
    pathsArr.every((p) => {
      const img = imageCache.get(p)
      return img?.complete && img.naturalWidth > 0
    })

  const nextPending =
    !tileImagesLoadFailed.value &&
    pathsArr.length > 0 &&
    !allImagesCached
  if (shellAssetsPending.value !== nextPending) {
    shellAssetsPending.value = nextPending
  }

  if (!allImagesCached && lastTileLoadKickEpoch !== tileLoadEpoch) {
    lastTileLoadKickEpoch = tileLoadEpoch
    const epoch = tileLoadEpoch
    void Promise.all(pathsArr.map((p) => ensureImage(p)))
      .then(() => {
        if (epoch === tileLoadEpoch) {
          schedulePaint()
        }
      })
      .catch(() => {
        if (epoch === tileLoadEpoch) {
          tileImagesLoadFailed.value = true
          schedulePaint()
        }
      })
  }

  if (tileImagesLoadFailed.value) {
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, cssW, cssH)
    return
  }

  for (let i = 0; i < mem.cells.length; i++) {
    const cell = mem.cells[i]
    const r = rects[i]
    if (!cell || !r) {
      continue
    }
    const entry = entryForIdentityInDeal(cell.identityIndex)
    const img = imageCache.get(entry.imagePath)
    const canvasPhase = drawPhaseForCanvas(cell.phase, debugPeekAllFaces.value)
    const { firstIndex, secondIndex } = mem.pair
    const isMismatchTile =
      isWrongPairPending(mem) &&
      firstIndex !== null &&
      secondIndex !== null &&
      (i === firstIndex || i === secondIndex)
    const conceal = mismatchConceal01ForCell(now, mem, i)
    const hl =
      reducedMotion.value || canvasPhase === 'concealed'
        ? null
        : {
            nx: highlightSmNx[i] ?? 0.5,
            ny: highlightSmNy[i] ?? 0.5,
          }
    drawTile(ctx, r, {
      phase: canvasPhase,
      img,
      catalogColor: entry.color || '#334155',
      rarity: entry.rarity || '',
      parallax: parallaxSm[i] ?? { ox: 0, oy: 0 },
      reducedMotion: reducedMotion.value,
      reveal01: debugPeekAllFaces.value ? 1 : (reveal01[i] ?? 1),
      matchFade01: matchFade01[i] ?? 0,
      shakePx:
        isMismatchTile && conceal === undefined ? shakeBase : 0,
      mismatchConceal01: conceal,
      forceShowFace: debugPeekAllFaces.value,
      faceHighlight: hl,
    })
  }

  const nStrip = stripChips.value.length
  for (let s = 0; s < nStrip; s++) {
    const chip = stripChips.value[s]!
    const tr = stripChipRect(bs.stripY, bs.stripH, cssW, s, nStrip)
    const e = entryForIdentityInDeal(chip.identityIndex)
    const simg = imageCache.get(e.imagePath)
    drawTile(ctx, tr, {
      phase: 'revealed',
      img: simg,
      catalogColor: e.color || '#334155',
      rarity: e.rarity || '',
      parallax: { ox: 0, oy: 0 },
      reducedMotion: reducedMotion.value,
      reveal01: 1,
      matchFade01: 0,
      shakePx: 0,
      forceShowFace: debugPeekAllFaces.value,
      faceHighlight: faceHighlightForRect(tr),
    })
  }

  if (collectFlight && !reducedMotion.value) {
    const cf = collectFlight
    const nextCount = stripChips.value.length + 1
    const slot = stripChips.value.length
    const tr = stripChipRect(bs.stripY, bs.stripH, cssW, slot, nextCount)
    const tcx = tr.x + tr.w / 2
    const tcy = tr.y + tr.h / 2
    const ra = lerpCollectRect(cf.fromA, tcx, tcy, tr.w, tr.h, cf.t)
    const rb = lerpCollectRect(cf.fromB, tcx, tcy, tr.w, tr.h, cf.t)
    const e = entryForIdentityInDeal(cf.identityIndex)
    const simg = imageCache.get(e.imagePath)
    drawTile(ctx, ra, {
      phase: 'revealed',
      img: simg,
      catalogColor: e.color || '#334155',
      rarity: e.rarity || '',
      parallax: { ox: 0, oy: 0 },
      reducedMotion: reducedMotion.value,
      reveal01: 1,
      matchFade01: 0,
      shakePx: 0,
      forceShowFace: debugPeekAllFaces.value,
      faceHighlight: faceHighlightForRect(ra),
    })
    drawTile(ctx, rb, {
      phase: 'revealed',
      img: simg,
      catalogColor: e.color || '#334155',
      rarity: e.rarity || '',
      parallax: { ox: 0, oy: 0 },
      reducedMotion: reducedMotion.value,
      reveal01: 1,
      matchFade01: 0,
      shakePx: 0,
      forceShowFace: debugPeekAllFaces.value,
      faceHighlight: faceHighlightForRect(rb),
    })
  }

  mismatchPhaseUi.value = computeMismatchPhaseUi(now, mem)

  const collectAnimating =
    collectFlight !== null && !reducedMotion.value && collectFlight.t < 1
  if (
    animationActive(mem, parallaxSettling) ||
    animAdvancing ||
    collectAnimating ||
    highlightSettling
  ) {
    schedulePaint()
  }
}

function schedulePaint(): void {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    void paint()
  })
}

function difficultyForFreshRound(): Difficulty {
  const fromReload = consumeReloadNewGameDifficulty()
  if (fromReload) {
    settings.$patch({ difficulty: fromReload })
    return fromReload
  }
  return settings.difficulty
}

function beginFreshDealFromBriefcaseNavigation(): void {
  const d = difficultyForFreshRound()
  session.beginSession(d, {
    dealBriefcaseSeedRaw: settings.briefcaseSeedRaw,
  })
  startNewRoundFromBriefcaseNavigation(
    layout.value,
    d,
    window.history.state,
    takeDealRng,
    (grid, rng, opts) => play.startNewRound(grid, rng, opts),
  )
  void stripMemoDealFromHistory()
}

function initRoundIfNeeded(): void {
  const snap = session.loadInProgressSnapshot()
  if (snap && snap.session.status === 'in_progress') {
    session.restoreFromSnapshot(snap)
    settings.$patch({ difficulty: snap.session.difficulty })
    play.hydrateFromSnapshot(snap.cells, snap.pair, snap.session.difficulty)
    void stripMemoDealFromHistory()
  } else if (!play.memory) {
    beginFreshDealFromBriefcaseNavigation()
  } else if (play.memory.cells.length !== layout.value.totalCells) {
    beginFreshDealFromBriefcaseNavigation()
  }
}

let reducedMotionMq: MediaQueryList | null = null
let onReducedMotionChange: (() => void) | null = null

onMounted(() => {
  reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = reducedMotionMq.matches
  onReducedMotionChange = () => {
    reducedMotion.value = reducedMotionMq?.matches ?? false
  }
  reducedMotionMq.addEventListener('change', onReducedMotionChange)
  initRoundIfNeeded()

  const wrap = shellRef.value
  if (wrap) {
    observer = new ResizeObserver(() => schedulePaint())
    observer.observe(wrap)
  }
  schedulePaint()
})

onUnmounted(() => {
  if (reducedMotionMq && onReducedMotionChange) {
    reducedMotionMq.removeEventListener('change', onReducedMotionChange)
  }
  reducedMotionMq = null
  onReducedMotionChange = null
  observer?.disconnect()
  observer = null
  cancelAnimationFrame(raf)
  play.clearMismatchTimer()
})

watch(
  () => play.memory,
  () => {
    session.scheduleSave(play.memory)
    schedulePaint()
  },
  { deep: true },
)

watch(debugPeekAllFaces, () => {
  schedulePaint()
})

</script>

<template>
  <div
    ref="shellRef"
    data-testid="game-canvas-shell"
    class="game-canvas-shell relative mx-auto w-full max-w-[min(100%,1200px)] touch-manipulation"
    :style="{ maxWidth: `${BOARD_MAX_WIDTH_CSS}px` }"
    :data-deal-init="play.dealInitKind"
    :data-mismatch-phase="mismatchPhaseUi"
    @mousemove="onShellPointerMove"
    @touchmove.passive="onShellPointerMove"
  >
    <div
      data-testid="game-grid-meta"
      class="sr-only"
      :data-rows="rowsAttr"
      :data-cols="colsAttr"
      :data-cells="cellsAttr"
    >
      Grid {{ rowsAttr }}×{{ colsAttr }}, {{ cellsAttr }} cells
    </div>
    <div
      data-testid="game-memory-debug"
      class="sr-only"
      :data-revealed="String(revealedCount)"
      :data-matched="String(matchedCount)"
      :data-identities="identityOrderAttr"
    />
    <div
      data-testid="game-initial-identities"
      class="sr-only"
      :data-identities="initialIdentitiesJson"
    />
    <div
      data-testid="game-collect-strip"
      class="sr-only"
      :data-collect-count="String(stripChips.length)"
      :aria-label="`Collected pairs: ${stripChips.length}`"
    />
    <button
      v-if="showDebugPeekButton"
      type="button"
      class="absolute right-2 top-0 z-10 rounded border border-amber-600/80 bg-amber-950/90 px-2 py-1 font-sans text-xs font-medium text-amber-100 shadow hover:bg-amber-900/90"
      data-testid="game-debug-peek-faces"
      :aria-pressed="debugPeekAllFaces ? 'true' : 'false'"
      :aria-label="
        debugPeekAllFaces
          ? 'Hide all tile faces (debug)'
          : 'Show all tile faces (debug)'
      "
      @click="onDebugPeekToggle"
    >
      {{ debugPeekAllFaces ? 'Hide faces' : 'Debug: faces' }}
    </button>
    <canvas
      ref="canvasRef"
      data-testid="game-canvas"
      class="aspect-square max-h-[min(70vh,900px)] w-full rounded-memo-md border border-memo-border bg-memo-surface"
      role="img"
      :aria-label="ariaBoard"
      :aria-busy="shellAssetsPending ? 'true' : 'false'"
      @click="onCanvasPick"
      @touchend.prevent="onCanvasPick"
    />
    <div
      v-if="shellAssetsPending"
      data-testid="game-canvas-assets-loading"
      class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-memo-md"
      aria-live="polite"
    >
      <span
        class="rounded-memo-md border border-memo-border/80 bg-memo-surface/90 px-3 py-1.5 text-xs font-medium text-slate-400 shadow backdrop-blur-sm"
      >
        Loading artwork…
      </span>
    </div>
  </div>
</template>
