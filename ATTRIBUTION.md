# Third-party data and assets

## ByMykel CSGO-API (MIT)

Tile **metadata** (names, rarity labels, colors) and **source image URLs** come from the unofficial **[ByMykel/CSGO-API](https://github.com/ByMykel/CSGO-API)** project (MIT License).

This app **vendors** a fixed subset of images under `public/tiles/` and ships `src/data/tile-library.json` so gameplay and the Game screen work **offline** without calling that API or remote image hosts at runtime.

Regenerate files with:

```bash
pnpm run fetch-tiles
```

Counter-Strike and related marks are property of their respective owners; this project is a non-commercial exercise and does not imply endorsement.
