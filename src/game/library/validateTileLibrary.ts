import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { TileLibraryFile } from '@/game/library/tileLibraryTypes'

const REQUIRED = ['id', 'rarity', 'color', 'imagePath'] as const

/** Pure structural validation (no filesystem). */
export function validateTileLibraryData(data: unknown): string | null {
  if (data === null || typeof data !== 'object') {
    return 'root must be an object'
  }
  const root = data as Record<string, unknown>
  if (!Array.isArray(root.entries)) {
    return 'entries must be an array'
  }
  if (root.entries.length !== 32) {
    return `entries must have exactly 32 items, got ${root.entries.length}`
  }
  const seenPaths = new Set<string>()
  for (let i = 0; i < root.entries.length; i++) {
    const e = root.entries[i]
    if (e === null || typeof e !== 'object') {
      return `entry ${i} must be an object`
    }
    const o = e as Record<string, unknown>
    for (const key of REQUIRED) {
      const v = o[key]
      if (typeof v !== 'string' || !v.trim()) {
        return `entry ${i} missing or empty string: ${key}`
      }
    }
    const imagePath = o.imagePath as string
    if (!imagePath.startsWith('/')) {
      return `entry ${i} imagePath must start with /`
    }
    if (seenPaths.has(imagePath)) {
      return `duplicate imagePath: ${imagePath}`
    }
    seenPaths.add(imagePath)
  }
  return null
}

/** Resolve `imagePath` (/tiles/x) to a file under repo `public/`. */
export function imagePathToPublicFile(imagePath: string, publicRoot: string): string {
  const rel = imagePath.replace(/^\/+/, '')
  return join(publicRoot, rel)
}

/** Ensure every entry’s image file exists under `publicRoot` (repo root + `public`). */
export function validateTileFilesOnDisk(
  library: TileLibraryFile,
  publicRoot: string,
): string | null {
  for (let i = 0; i < library.entries.length; i++) {
    const p = imagePathToPublicFile(library.entries[i].imagePath, publicRoot)
    if (!existsSync(p)) {
      return `entry ${i} image missing on disk: ${p}`
    }
  }
  return null
}

export function validateTileLibraryFull(
  data: unknown,
  publicRoot: string,
): string | null {
  const err = validateTileLibraryData(data)
  if (err) {
    return err
  }
  return validateTileFilesOnDisk(data as TileLibraryFile, publicRoot)
}

export function assertValidTileLibrary(data: unknown, publicRoot: string): void {
  const err = validateTileLibraryFull(data, publicRoot)
  if (err) {
    throw new Error(err)
  }
}
