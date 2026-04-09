/**
 * Warm browser HTTP cache + decode pipeline for tile PNGs before `/game`.
 * Matches deal subset: first `n` library entries per difficulty (see `buildGridLayout`).
 */
import rawLibrary from '@/data/tile-library.json'
import { gridDimensions } from '@/game/canvas/buildGridLayout'
import type { Difficulty, TileLibraryFile } from '@/game/library/tileLibraryTypes'

function viteBaseAssetUrl(imagePath: string): string {
  const baseRaw = import.meta.env.BASE_URL
  const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`
  const p = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  return `${base}${p}`
}

export function tileImagePathsForDifficulty(
  difficulty: Difficulty,
  library: TileLibraryFile = rawLibrary as TileLibraryFile,
): string[] {
  const { n } = gridDimensions(difficulty)
  return library.entries.slice(0, n).map((e) => e.imagePath)
}

function preloadOne(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (typeof img.decode === 'function') {
        void img.decode().then(resolve, resolve)
      } else {
        resolve()
      }
    }
    img.onerror = () => {
      resolve()
    }
    img.src = url
  })
}

async function preloadUrlsSequentialBatched(
  urls: readonly string[],
  concurrency: number,
  shouldAbort: () => boolean,
): Promise<void> {
  const queue = [...urls]
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0 && !shouldAbort()) {
      const u = queue.shift()
      if (u) {
        await preloadOne(u)
      }
    }
  })
  await Promise.all(workers)
}

let warmupGeneration = 0
const DEFAULT_CONCURRENCY = 6

/**
 * After a short idle delay, loads tile images for the given difficulty in the background
 * so `/game` hits warm cache. Latest call wins if difficulty changes quickly.
 */
export function scheduleTileImageWarmup(
  difficulty: Difficulty,
  options?: { concurrency?: number },
): void {
  const gen = ++warmupGeneration
  const paths = tileImagePathsForDifficulty(difficulty)
  const urls = paths.map((p) => viteBaseAssetUrl(p))
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY

  const start = (): void => {
    if (gen !== warmupGeneration) {
      return
    }
    void preloadUrlsSequentialBatched(urls, concurrency, () => gen !== warmupGeneration)
  }

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(start, { timeout: 4000 })
  } else {
    setTimeout(start, 200)
  }
}
