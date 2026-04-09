/**
 * Image cache + URL resolution for the game canvas shell (extracted for a thinner SFC).
 */
export function createCanvasShellImageCache(getBaseUrl: () => string) {
  const imageCache = new Map<string, HTMLImageElement>()

  function assetUrl(imagePath: string): string {
    const baseRaw = getBaseUrl()
    const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`
    const p = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
    return `${base}${p}`
  }

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

  return { imageCache, ensureImage }
}
