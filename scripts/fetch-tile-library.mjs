#!/usr/bin/env node
/**
 * One-time maintainer script: fetch 32 skins from ByMykel CSGO-API, vendor images to public/tiles/.
 * Picks a diverse set (round-robin across categories), excluding gloves — raw JSON lists gloves first.
 * @see ATTRIBUTION.md
 */
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const publicTiles = path.join(root, 'public', 'tiles')
const outJson = path.join(root, 'src', 'data', 'tile-library.json')

const SKINS_URL =
  'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json'

/** Prefer these categories first so one type (e.g. Knives) does not dominate early slices. */
const CATEGORY_PRIORITY = [
  'Rifles',
  'Pistols',
  'SMGs',
  'Heavy',
  'Equipment',
  'Knives',
  'Other',
]

function extFromUrl(imageUrl) {
  try {
    const u = new URL(imageUrl)
    const m = u.pathname.match(/\.(png|jpg|jpeg|webp)$/i)
    if (m) {
      return m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase()
    }
  } catch {
    /* ignore */
  }
  return 'png'
}

function isGloveSkin(s) {
  const cat = (s.category?.name || '').toLowerCase()
  if (cat === 'gloves') {
    return true
  }
  const w = (s.weapon?.name || '').toLowerCase()
  return (
    w.includes('glove') ||
    w.includes('hand wraps') ||
    w.includes('wraps') ||
    w.includes('driver glove')
  )
}

/**
 * Take up to `count` skins, round-robin by category.name for visual diversity.
 */
function pickDiverseSkins(skins, count) {
  const buckets = new Map()
  for (const s of skins) {
    if (isGloveSkin(s)) {
      continue
    }
    const cat = s.category?.name || 'Other'
    if (!buckets.has(cat)) {
      buckets.set(cat, [])
    }
    buckets.get(cat).push(s)
  }

  const presentCats = [...buckets.keys()].sort((a, b) => {
    const ia = CATEGORY_PRIORITY.indexOf(a)
    const ib = CATEGORY_PRIORITY.indexOf(b)
    const sa = ia === -1 ? CATEGORY_PRIORITY.length : ia
    const sb = ib === -1 ? CATEGORY_PRIORITY.length : ib
    if (sa !== sb) {
      return sa - sb
    }
    return a.localeCompare(b)
  })

  const picked = []
  let round = 0
  while (picked.length < count) {
    let progressed = false
    for (const cat of presentCats) {
      const list = buckets.get(cat)
      if (list && round < list.length) {
        picked.push(list[round])
        progressed = true
        if (picked.length >= count) {
          break
        }
      }
    }
    round++
    if (!progressed) {
      break
    }
  }

  if (picked.length < count) {
    const seen = new Set(picked.map((s) => s.id))
    for (const s of skins) {
      if (picked.length >= count) {
        break
      }
      if (isGloveSkin(s) || seen.has(s.id)) {
        continue
      }
      picked.push(s)
      seen.add(s.id)
    }
  }

  return picked
}

async function emptyTilesDir() {
  await mkdir(publicTiles, { recursive: true })
  for (const f of await readdir(publicTiles)) {
    await unlink(path.join(publicTiles, f))
  }
}

async function main() {
  await emptyTilesDir()
  await mkdir(path.dirname(outJson), { recursive: true })

  const res = await fetch(SKINS_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch skins.json: HTTP ${res.status}`)
  }
  const skins = await res.json()
  const withImage = skins.filter(
    (s) => s?.image && typeof s.image === 'string' && s.image.startsWith('http'),
  )

  const picked = pickDiverseSkins(withImage, 32)
  if (picked.length < 32) {
    throw new Error(`Need 32 diverse skins; got ${picked.length} (check filters)`)
  }

  const entries = []
  for (const s of picked) {
    const id = String(s.id)
    const safe = id.replace(/[^a-zA-Z0-9_-]/g, '_')
    const ext = extFromUrl(s.image)
    const filename = `${safe}.${ext}`

    const imgRes = await fetch(s.image)
    if (!imgRes.ok) {
      throw new Error(`Image fetch failed ${imgRes.status}: ${s.image}`)
    }
    const buf = Buffer.from(await imgRes.arrayBuffer())
    await writeFile(path.join(publicTiles, filename), buf)

    entries.push({
      id,
      rarity: s.rarity?.name ?? 'Unknown',
      color: typeof s.rarity?.color === 'string' ? s.rarity.color : '#b0c3d9',
      imagePath: `/tiles/${filename}`,
    })
  }

  await writeFile(
    outJson,
    `${JSON.stringify({ version: 1, entries }, null, 2)}\n`,
    'utf8',
  )

  const breakdown = {}
  for (const s of picked) {
    const c = s.category?.name ?? '?'
    breakdown[c] = (breakdown[c] || 0) + 1
  }
  console.log(`Wrote ${entries.length} tiles → ${publicTiles}`)
  console.log('Category mix:', breakdown)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
