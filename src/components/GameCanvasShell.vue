<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import rawLibrary from '@/data/tile-library.json'
import { buildGridCells, gridDimensions } from '@/game/buildGridLayout'
import { cellRectsForGrid } from '@/game/cellRect'
import { cellIndexFromPointer } from '@/game/canvasHitTest'
import { BOARD_GAP_PX, BOARD_MAX_WIDTH_CSS } from '@/game/canvasLayout'
import { drawTile } from '@/game/canvasTileDraw'
import { consumeReloadNewGameDifficulty } from '@/game/reloadNewGameDifficulty'
import { createSeededRandom } from '@/game/seededRng'
import type { Difficulty, TileEntry, TileLibraryFile } from '@/game/tileLibraryTypes'
import { useGamePlayStore } from '@/stores/gamePlay'
import { useGameSessionStore } from '@/stores/gameSession'
import { useGameSettingsStore } from '@/stores/gameSettings'

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

const pointerCss = ref<{ x: number; y: number } | null>(null)
const reducedMotion = ref(false)

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

function assetUrl(imagePath: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  const p = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  return `${base}${p}`
}

const imageCache = new Map<string, HTMLImageElement>()

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Image failed to load: ${url}`))
    img.src = url
  })
}

async function ensureImage(imagePath: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(imagePath)
  if (cached?.complete && cached.naturalWidth > 0) {
    return cached
  }
  const url = assetUrl(imagePath)
  const img = await loadImage(url)
  imageCache.set(imagePath, img)
  return img
}

function subsetEntry(identityIndex: number): TileEntry {
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

  const { accepted, won } = play.tryPick(idx)
  if (accepted) {
    session.incrementClick()
  }
  if (won) {
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
  const { rects } = cellRectsForGrid(cssW, cssH, rows, cols, BOARD_GAP_PX)

  const paths = new Set<string>()
  for (const c of mem.cells) {
    paths.add(subsetEntry(c.identityIndex).imagePath)
  }
  try {
    await Promise.all([...paths].map((p) => ensureImage(p)))
  } catch {
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
    const entry = subsetEntry(cell.identityIndex)
    const img = imageCache.get(entry.imagePath)
    drawTile(
      ctx,
      r,
      cell.phase,
      img,
      entry.color || '#334155',
      pointerCss.value,
      reducedMotion.value,
    )
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

function initRoundIfNeeded(): void {
  const snap = session.loadInProgressSnapshot()
  if (snap && snap.session.status === 'in_progress') {
    session.restoreFromSnapshot(snap)
    settings.$patch({ difficulty: snap.session.difficulty })
    play.hydrateFromSnapshot(snap.cells, snap.pair, snap.session.difficulty)
  } else if (!play.memory) {
    const d = difficultyForFreshRound()
    session.beginSession(d)
    play.startNewRound(buildGridCells(entries, d), takeDealRng())
  } else if (play.memory.cells.length !== layout.value.totalCells) {
    const d = difficultyForFreshRound()
    session.beginSession(d)
    play.startNewRound(buildGridCells(entries, d), takeDealRng())
  }
}

onMounted(() => {
  reducedMotion.value = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  initRoundIfNeeded()

  const wrap = shellRef.value
  if (wrap) {
    observer = new ResizeObserver(() => schedulePaint())
    observer.observe(wrap)
  }
  schedulePaint()
})

onUnmounted(() => {
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

</script>

<template>
  <div
    ref="shellRef"
    class="game-canvas-shell mx-auto w-full max-w-[min(100%,1200px)] touch-manipulation px-2"
    :style="{ maxWidth: `${BOARD_MAX_WIDTH_CSS}px` }"
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
    <canvas
      ref="canvasRef"
      data-testid="game-canvas"
      class="aspect-square max-h-[min(70vh,900px)] w-full rounded-memo-md border border-memo-border bg-memo-surface"
      role="img"
      :aria-label="ariaBoard"
      @click="onCanvasPick"
      @touchend.prevent="onCanvasPick"
    />
  </div>
</template>
