/**
 * Resolves a file from the public folder. Root absolute paths break in the
 * packaged desktop app, where the renderer is loaded from a file:// URL.
 */
export function publicAsset(path: string) {
  const relativePath = path.startsWith('/') ? path.slice(1) : path

  return new URL(relativePath, document.baseURI).href
}
