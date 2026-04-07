<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import rawLibrary from '@/data/tile-library.json'
import { buildGridCells } from '@/game/buildGridLayout'
import type { TileEntry } from '@/game/tileLibraryTypes'
import { useGameSettingsStore } from '@/stores/gameSettings'

defineOptions({ name: 'GameCanvasShell' })

const entries = (rawLibrary as { entries: TileEntry[] }).entries

const shellRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const store = useGameSettingsStore()

const layout = computed(() => buildGridCells(entries, store.difficulty))

const rowsAttr = computed(() => String(layout.value.rows))
const colsAttr = computed(() => String(layout.value.cols))
const cellsAttr = computed(() => String(layout.value.totalCells))

const ariaBoard = computed(() => {
  const { rows, cols } = layout.value
  return `Memory game board, ${rows} by ${cols} tile grid, display only`
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

let raf = 0
let observer: ResizeObserver | null = null

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

  const { rows, cols, cells } = layout.value
  const cellW = cssW / cols
  const cellH = cssH / rows

  const uniquePaths = [...new Set(cells.map((c) => c.entry.imagePath))]
  try {
    await Promise.all(uniquePaths.map((p) => ensureImage(p)))
  } catch {
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, cssW, cssH)
    return
  }

  ctx.clearRect(0, 0, cssW, cssH)
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, cssW, cssH)

  for (const cell of cells) {
    const img = imageCache.get(cell.entry.imagePath)
    if (!img) {
      continue
    }
    const x = cell.col * cellW
    const y = cell.row * cellH
    const pad = 1
    ctx.strokeStyle = cell.entry.color || '#334155'
    ctx.lineWidth = 1
    ctx.strokeRect(x + pad / 2, y + pad / 2, cellW - pad, cellH - pad)
    ctx.drawImage(img, x + pad, y + pad, cellW - pad * 2, cellH - pad * 2)
  }
}

function schedulePaint(): void {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    void paint()
  })
}

onMounted(() => {
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
})

watch(
  () => store.difficulty,
  () => {
    schedulePaint()
  },
)
</script>

<template>
  <div
    ref="shellRef"
    class="game-canvas-shell mx-auto w-full max-w-md touch-manipulation px-2"
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
    <canvas
      ref="canvasRef"
      data-testid="game-canvas"
      class="aspect-square max-h-[50vh] w-full rounded-memo-md border border-memo-border bg-memo-surface"
      role="img"
      :aria-label="ariaBoard"
    />
  </div>
</template>
