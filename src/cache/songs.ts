import {
  clear,
  createStore,
  delMany,
  get,
  keys,
  set,
  setMany,
} from 'idb-keyval'
import { logger } from '@/utils/logger'

/**
 * A store of its own. Audio blobs used to share idb-keyval's default store
 * with the persisted player queue, which meant gigabytes of media sitting in
 * front of the read that restores playback, and a clear that had to pick its
 * own keys out by prefix.
 */
const songStore = createStore('song-cache', 'songs')

const BLOB_PREFIX = 'blob:'
const META_PREFIX = 'meta:'

/** Where the cache lived before it had a store of its own. */
const LEGACY_PREFIXES = ['song-cache:blob:', 'song-cache:meta:']

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
    const allKeys = await keys(songStore)
    const metaKeys = allKeys.filter(
      (key): key is string =>
        typeof key === 'string' && key.startsWith(META_PREFIX),
    )

    const entries = await Promise.all(
      metaKeys.map((key) => get<CachedSong>(key, songStore)),
    )

    return entries.filter((entry): entry is CachedSong => entry !== undefined)
  } catch (error) {
    logger.error('[songCache] - Could not read the cache index', { error })

    return []
  }
}

export async function readSongBlob(id: string) {
  try {
    return await get<Blob>(blobKey(id), songStore)
  } catch (error) {
    logger.error('[songCache] - Could not read a cached song', { id, error })

    return undefined
  }
}

/**
 * Whether a failed write means the device is out of room for us, rather than
 * something being broken.
 */
export function isQuotaError(error: unknown) {
  const name = (error as { name?: string } | null)?.name

  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED'
}

export async function writeSong(
  id: string,
  blob: Blob,
  pinned: boolean,
): Promise<CachedSong> {
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
    // One transaction: a blob written without its metadata is invisible to
    // the index, so nothing would ever count it, evict it or clear it.
    await setMany(
      [
        [blobKey(id), blob],
        [metaKey(id), entry],
      ],
      songStore,
    )

    return entry
  } catch (error) {
    await removeSong(id)
    throw error
  }
}

export async function updateSongMeta(entry: CachedSong) {
  try {
    await set(metaKey(entry.id), entry, songStore)
  } catch (error) {
    logger.error('[songCache] - Could not update a cache entry', {
      id: entry.id,
      error,
    })
  }
}

export async function removeSong(id: string) {
  try {
    await delMany([blobKey(id), metaKey(id)], songStore)
  } catch (error) {
    logger.error('[songCache] - Could not remove a cached song', { id, error })
  }
}

/** Throws on failure: the caller tells the user whether it worked. */
export async function clearSongCache() {
  await clear(songStore)
}

/**
 * Drops what the cache left in the shared store before it moved. The blobs are
 * not carried over: they are re-downloadable, and copying gigabytes between
 * stores on start is worse than fetching again on demand.
 */
export async function dropLegacyCache() {
  try {
    const allKeys = await keys()
    const ours = allKeys.filter(
      (key): key is string =>
        typeof key === 'string' &&
        LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix)),
    )

    if (ours.length === 0) return

    await delMany(ours)
    logger.info('[songCache] - Removed the cache left in the shared store', {
      count: ours.length,
    })
  } catch (error) {
    logger.error('[songCache] - Could not remove the legacy cache', { error })
  }
}

function leastRecentlyUsed(entries: CachedSong[]) {
  return entries
    .filter((entry) => !entry.pinned)
    .sort((a, b) => a.lastUsedAt - b.lastUsedAt)
}

/**
 * Picks the entries to drop so the cache fits the limit again. Pinned songs
 * are never chosen, so a limit smaller than what was saved on purpose leaves
 * the cache above it rather than throwing away what the user asked to keep.
 */
export function selectEvictions(entries: CachedSong[], limitBytes: number) {
  const total = entries.reduce((sum, entry) => sum + entry.size, 0)

  if (total <= limitBytes) return []

  const evictions: CachedSong[] = []
  let freed = 0

  for (const entry of leastRecentlyUsed(entries)) {
    if (total - freed <= limitBytes) break

    evictions.push(entry)
    freed += entry.size
  }

  return evictions
}

/**
 * Picks the entries to drop to free at least this many bytes, oldest use
 * first. Used when the device refuses a write, where the limit says nothing
 * about how much room is actually left.
 */
export function selectLeastUsed(entries: CachedSong[], bytesNeeded: number) {
  const evictions: CachedSong[] = []
  let freed = 0

  for (const entry of leastRecentlyUsed(entries)) {
    if (freed >= bytesNeeded) break

    evictions.push(entry)
    freed += entry.size
  }

  return evictions
}
