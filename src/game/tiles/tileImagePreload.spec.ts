import { describe, expect, it } from 'vitest'
import { tileImagePathsForDifficulty } from '@/game/tiles/tileImagePreload'
import rawLibrary from '@/data/tile-library.json'
import type { TileLibraryFile } from '@/game/library/tileLibraryTypes'

const lib = rawLibrary as TileLibraryFile

describe('tileImagePathsForDifficulty', () => {
  it('returns first 8 paths for easy', () => {
    const paths = tileImagePathsForDifficulty('easy', lib)
    expect(paths).toHaveLength(8)
    expect(paths[0]).toBe(lib.entries[0]!.imagePath)
    expect(paths[7]).toBe(lib.entries[7]!.imagePath)
  })

  it('returns first 18 paths for medium', () => {
    expect(tileImagePathsForDifficulty('medium', lib)).toHaveLength(18)
  })

  it('returns all library paths for hard when library has 32 entries', () => {
    const paths = tileImagePathsForDifficulty('hard', lib)
    expect(paths).toHaveLength(32)
    expect(paths[31]).toBe(lib.entries[31]!.imagePath)
  })
})
