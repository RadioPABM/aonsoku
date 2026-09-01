import { del, get, keys, set } from 'idb-keyval'
import { logger } from '@/utils/logger'

const BLOB_PREFIX = 'song-cache:blob:'
const META_PREFIX = 'song-cache:meta:'

export interface CachedSong {
  id: string
  size: number
  type: string
  cachedAt: number
  lastUsedAt: number
  /** Saved on purpose from an album, playlist or artist; never evicted. */
  pinned: boolean
}

function blobKey(id: string) {
  return `${BLOB_PREFIX}${id}`
}

function metaKey(id: string) {
  return `${META_PREFIX}${id}`
}

export async function readCachedSongs(): Promise<CachedSong[]> {
  try {
    const allKeys = await keys()
    const metaKeys = allKeys.filter(
      (key): key is string =>
        typeof key === 'string' && key.startsWith(META_PREFIX),
    )

    const entries = await Promise.all(
      metaKeys.map((key) => get<CachedSong>(key)),
    )

    return entries.filter((entry): entry is CachedSong => entry !== undefined)
  } catch (error) {
    logger.error('[songCache] - Could not read the cache index', { error })

    return []
  }
}

export async function readSongBlob(id: string) {
  try {
    return await get<Blob>(blobKey(id))
  } catch (error) {
    logger.error('[songCache] - Could not read a cached song', { id, error })

    return undefined
  }
}

export async function writeSong(
  id: string,
  blob: Blob,
  pinned: boolean,
): Promise<CachedSong | undefined> {
  const now = Date.now()
  const entry: CachedSong = {
    id,
    size: blob.size,
    type: blob.type,
    cachedAt: now,
    lastUsedAt: now,
    pinned,
  }

  try {
    await set(blobKey(id), blob)
    await set(metaKey(id), entry)

    return entry
  } catch (error) {
    // Running out of quota lands here; the blob may be half written, so the
    // metadata is dropped to keep the index honest.
    logger.error('[songCache] - Could not store a song', { id, error })
    await removeSong(id)

    return undefined
  }
}

export async function updateSongMeta(entry: CachedSong) {
  try {
    await set(metaKey(entry.id), entry)
  } catch (error) {
    logger.error('[songCache] - Could not update a cache entry', {
      id: entry.id,
      error,
    })
  }
}

export async function removeSong(id: string) {
  try {
    await del(blobKey(id))
    await del(metaKey(id))
  } catch (error) {
    logger.error('[songCache] - Could not remove a cached song', { id, error })
  }
}

export async function clearSongCache() {
  try {
    const allKeys = await keys()
    const ours = allKeys.filter(
      (key): key is string =>
        typeof key === 'string' &&
        (key.startsWith(BLOB_PREFIX) || key.startsWith(META_PREFIX)),
    )

    await Promise.all(ours.map((key) => del(key)))
  } catch (error) {
    logger.error('[songCache] - Could not clear the cache', { error })
  }
}

/**
 * Picks the entries to drop so the cache fits the limit again. Pinned songs
 * are never chosen, so a limit smaller than what was saved on purpose leaves
 * the cache above it rather than throwing away what the user asked to keep.
 */
export function selectEvictions(entries: CachedSong[], limitBytes: number) {
  const total = entries.reduce((sum, entry) => sum + entry.size, 0)

  if (total <= limitBytes) return []

  const candidates = entries
    .filter((entry) => !entry.pinned)
    .sort((a, b) => a.lastUsedAt - b.lastUsedAt)

  const evictions: CachedSong[] = []
  let freed = 0

  for (const entry of candidates) {
    if (total - freed <= limitBytes) break

    evictions.push(entry)
    freed += entry.size
  }

  return evictions
}
