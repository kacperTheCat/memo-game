export type Difficulty = 'easy' | 'medium' | 'hard'

export interface TileEntry {
  id: string
  rarity: string
  color: string
  /** App path to a file under `public/` (e.g. `/tiles/foo.png`). */
  imagePath: string
}

export interface TileLibraryFile {
  version?: number
  entries: TileEntry[]
}
