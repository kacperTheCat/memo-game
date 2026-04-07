# Data model: tile library & grid display

**Spec**: `spec.md` | **Branch**: `003-csgo-tile-libraries`

## Entity: `TileEntry`

| Field | Type | Rules |
|--------|------|--------|
| `id` | `string` | Stable unique id (e.g. CSGO-API skin id or slug); used for ordering and tests. |
| `rarity` | `string` | Non-empty display label (English), aligned with source tier name. |
| `color` | `string` | Hex or CSS color (e.g. `#eb4b4b`); from source rarity color when available. |
| `imagePath` | `string` | App-resolvable path to **bundled** static file (e.g. `/tiles/skin-12345.png`); MUST exist after ingest script. |

**Validation:** All fields required; `imagePath` MUST start with `/` for public assets.

---

## Entity: `TileLibrary`

| Field | Type | Rules |
|--------|------|--------|
| `version` | `number` (optional) | Bump when regenerating data. |
| `entries` | `TileEntry[]` | **Exactly 32** items for the primary shipped library. |

**Validation (Vitest / CI):** `entries.length === 32`; each entry passes `TileEntry` rules; each `imagePath` file exists under `public/`.

---

## Value: `Difficulty`

`type Difficulty = 'easy' | 'medium' | 'hard'`

| Value | Grid (rows × cols) | Unique identities used | Total cells | Fill rule |
|--------|---------------------|-------------------------|-------------|-----------|
| `easy` | 4 × 4 | First **8** entries | 16 | Each of 8 identities appears **twice**, row-major order: `[0..7, 0..7]`. |
| `medium` | 6 × 6 | First **18** entries | 36 | `[0..17, 0..17]` row-major. |
| `hard` | 8 × 8 | All **32** entries | 64 | `[0..31, 0..31]` row-major. |

---

## Derived: `GridCell` (runtime)

Not persisted; computed for canvas paint.

| Field | Type | Description |
|--------|------|-------------|
| `row` | `number` | 0-based. |
| `col` | `number` | 0-based. |
| `tileIndex` | `number` | Index into **ordered** `entries` subset (0..n-1). |
| `entry` | `TileEntry` | Resolved metadata for that cell. |

**Algorithm:** Let `subset = library.entries.slice(0, n)`. Row-major cell index `k = row * cols + col` runs `0 .. 2n-1`. Identity index for cell `k` is **`i = k % n`** (two full cycles: `0..n-1`, then `0..n-1`). Cell `(row,col)` shows `subset[i]`.

---

## State: `GameSettings` (Pinia)

| Field | Type | Default | Rules |
|--------|------|---------|--------|
| `difficulty` | `Difficulty` | `'medium'` | Written from Briefcase; read on Game route. |

**Persistence:** In-memory first; spec allows optional client persistence later.

---

## Relationships

- `TileLibrary` contains 32 `TileEntry` records (1:N).
- `GameSettings.difficulty` selects **n** and grid dimensions; renderer uses `TileLibrary.entries[0..n-1]` only.
