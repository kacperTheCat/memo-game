import { describe, expect, it } from 'vitest'
import libraryJson from '@/data/tile-library.json'
import type { TileEntry } from '@/game/library/tileLibraryTypes'
import {
  imagePathToPublicFile,
  validateTileFilesOnDisk,
  validateTileLibraryData,
  validateTileLibraryFull,
} from '@/game/library/validateTileLibrary'
import { join } from 'node:path'

function entry(partial: Partial<TileEntry> & Pick<TileEntry, 'id'>): TileEntry {
  return {
    rarity: 'Mil-Spec',
    color: '#4b69ff',
    imagePath: `/tiles/${partial.id}.png`,
    ...partial,
  }
}

describe('validateTileLibraryData', () => {
  it('accepts 32 well-formed entries', () => {
    const entries = Array.from({ length: 32 }, (_, i) =>
      entry({ id: `skin-${i}`, imagePath: `/tiles/a${i}.png` }),
    )
    expect(validateTileLibraryData({ entries })).toBeNull()
  })

  it('rejects wrong count', () => {
    expect(validateTileLibraryData({ entries: [] })!.toLowerCase()).toMatch(
      /exactly 32/,
    )
  })

  it('rejects missing fields', () => {
    const entries = Array.from({ length: 32 }, (_, i) => ({
      id: `x-${i}`,
      rarity: '',
      color: '#fff',
      imagePath: `/tiles/x${i}.png`,
    }))
    expect(validateTileLibraryData({ entries })).toMatch(/rarity/)
  })

  it('rejects duplicate imagePath', () => {
    const entries = Array.from({ length: 32 }, (_, i) =>
      entry({ id: `skin-${i}`, imagePath: '/tiles/same.png' }),
    )
    expect(validateTileLibraryData({ entries })).toMatch(/duplicate imagePath/)
  })

  it('rejects imagePath without leading slash', () => {
    const entries = Array.from({ length: 32 }, (_, i) =>
      entry({ id: `skin-${i}`, imagePath: `tiles/x${i}.png` }),
    )
    expect(validateTileLibraryData({ entries })).toMatch(/start with/)
  })
})

describe('validateTileLibraryFull (committed JSON)', () => {
  const publicRoot = join(process.cwd(), 'public')

  it('committed tile-library.json passes structure + files on disk', () => {
    expect(validateTileLibraryFull(libraryJson, publicRoot)).toBeNull()
  })

  it('maps imagePath to public folder', () => {
    expect(imagePathToPublicFile('/tiles/foo.png', publicRoot)).toBe(
      join(publicRoot, 'tiles', 'foo.png'),
    )
  })

  it('validateTileFilesOnDisk fails for missing files', () => {
    const badLib = {
      entries: [
        {
          id: 'a',
          rarity: 'r',
          color: '#fff',
          imagePath: '/tiles/__definitely_missing__.png',
        },
      ],
    }
    expect(validateTileFilesOnDisk(badLib as { entries: TileEntry[] }, publicRoot)).toMatch(
      /missing on disk/,
    )
  })
})
