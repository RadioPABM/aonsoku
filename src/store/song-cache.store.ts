import merge from 'lodash/merge'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createWithEqualityFn } from 'zustand/traditional'
import { getSongStreamUrl } from '@/api/httpClient'
import {
  CachedSong,
  clearSongCache,
  isQuotaError,
  readCachedSongs,
  removeSong,
  selectEvictions,
  selectLeastUsed,
  updateSongMeta,
  writeSong,
} from '@/cache/songs'
import { ISong } from '@/types/responses/song'
import { ensureSupportForAlac } from '@/utils/alac'
import { logger } from '@/utils/logger'

export const GIGABYTE = 1024 * 1024 * 1024
export const DEFAULT_CACHE_LIMIT = 2 * GIGABYTE
export const CACHE_LIMIT_OPTIONS = [1, 2, 5, 10, 20].map(
  (size) => size * GIGABYTE,
)

/** Saving a whole album should not take the server hostage. */
const MAX_PARALLEL_DOWNLOADS = 3

/** How many rounds of making room a single song is worth. */
const MAX_QUOTA_RETRIES = 4

/**
 * Freeing exactly what one song needs would mean evicting again for the next
 * one, so each round asks for a few songs worth of room.
 */
const QUOTA_HEADROOM = 4

export interface CacheJob {
  total: number
  done: number
  failed: number
}

interface ISongCacheContext {
  entries: Record<string, CachedSong>
  /** Songs being fetched right now, so buttons can show themselves working. */
  pending: Record<string, boolean>
  /** Progress of a collection the user asked to save, keyed by its id. */
  jobs: Record<string, CacheJob>
  /**
   * Song ids saved for an album, playlist or artist, so the button can tell
   * what it did without listing the collection again.
   */
  collections: Record<string, string[]>
  hydrated: boolean
  settings: {
    limitBytes: number
    autoCacheEnabled: boolean
  }
  actions: {
    hydrate: () => Promise<void>
    cacheSongs: (songs: ISong[], options?: CacheOptions) => Promise<void>
    saveCollection: (id: string, songs: ISong[]) => Promise<void>
    forgetCollection: (id: string, songs: ISong[]) => Promise<void>
    removeSongs: (ids: string[]) => Promise<void>
    clear: () => Promise<void>
    touch: (id: string) => void
    setLimitBytes: (value: number) => void
    setAutoCacheEnabled: (value: boolean) => void
  }
}

interface CacheOptions {
  /** Kept until explicitly removed instead of being evicted by age. */
  pinned?: boolean
  /** Groups the songs under one progress entry, e.g. an album id. */
  jobId?: string
}

async function fetchSongBlob(song: ISong) {
  const url = getSongStreamUrl(
    song.id,
    undefined,
    ensureSupportForAlac(song.suffix),
  )

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Stream request failed with ${response.status}`)
  }

  return response.blob()
}

async function runWithLimit<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  const queue = [...items]

  async function drain() {
    while (queue.length > 0) {
      const item = queue.shift()
      if (item === undefined) return

      await worker(item)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => drain()),
  )
}

export const useSongCacheStore = createWithEqualityFn<ISongCacheContext>()(
  subscribeWithSelector(
    persist(
      devtools(
        immer((set, get) => ({
          entries: {},
          pending: {},
          jobs: {},
          collections: {},
          hydrated: false,
          settings: {
            limitBytes: DEFAULT_CACHE_LIMIT,
            autoCacheEnabled: true,
          },
          actions: {
            hydrate: async () => {
              const stored = await readCachedSongs()

              set((state) => {
                state.entries = Object.fromEntries(
                  stored.map((entry) => [entry.id, entry]),
                )
                state.hydrated = true
              })
            },

            cacheSongs: async (songs, options = {}) => {
              const { pinned = false, jobId } = options
              const { entries, pending } = get()

              // Pinning something the player already saved on its own only
              // has to flip the flag, no second download.
              const toPin = pinned
                ? songs.filter((song) => entries[song.id]?.pinned === false)
                : []

              for (const song of toPin) {
                const entry = { ...entries[song.id], pinned: true }
                await updateSongMeta(entry)
                set((state) => {
                  state.entries[song.id] = entry
                })
              }

              const missing = songs.filter(
                (song) => !get().entries[song.id] && !pending[song.id],
              )

              if (missing.length === 0) return

              if (jobId) {
                set((state) => {
                  state.jobs[jobId] = {
                    total: missing.length,
                    done: 0,
                    failed: 0,
                  }
                })
              }

              set((state) => {
                for (const song of missing) state.pending[song.id] = true
              })

              await runWithLimit(
                missing,
                MAX_PARALLEL_DOWNLOADS,
                async (song) => {
                  try {
                    const blob = await fetchSongBlob(song)
                    const entry = await storeSong(song.id, blob, pinned)

                    set((state) => {
                      state.entries[song.id] = entry
                    })

                    if (jobId) {
                      set((state) => {
                        const job = state.jobs[jobId]
                        if (job) job.done += 1
                      })
                    }
                  } catch (error) {
                    logger.error('[songCache] - Could not download a song', {
                      id: song.id,
                      error,
                    })

                    if (jobId) {
                      set((state) => {
                        const job = state.jobs[jobId]
                        if (job) job.failed += 1
                      })
                    }
                  } finally {
                    set((state) => {
                      delete state.pending[song.id]
                    })
                  }
                },
              )

              if (jobId) {
                set((state) => {
                  delete state.jobs[jobId]
                })
              }

              await evictOverLimit()
            },

            saveCollection: async (id, songs) => {
              set((state) => {
                state.collections[id] = songs.map((song) => song.id)
              })

              await get().actions.cacheSongs(songs, {
                pinned: true,
                jobId: id,
              })
            },

            forgetCollection: async (id, songs) => {
              const stored = get().collections[id] ?? []
              const ids = stored.length > 0 ? stored : songs.map((s) => s.id)

              set((state) => {
                delete state.collections[id]
              })

              await get().actions.removeSongs(ids)
            },

            removeSongs: async (ids) => {
              await Promise.all(ids.map((id) => removeSong(id)))

              set((state) => {
                for (const id of ids) delete state.entries[id]
              })
            },

            clear: async () => {
              await clearSongCache()

              set((state) => {
                state.entries = {}
                state.collections = {}
              })
            },

            touch: (id) => {
              const entry = get().entries[id]
              if (!entry) return

              const updated = { ...entry, lastUsedAt: Date.now() }

              set((state) => {
                state.entries[id] = updated
              })

              updateSongMeta(updated)
            },

            setLimitBytes: (value) => {
              set((state) => {
                state.settings.limitBytes = value
              })

              evictOverLimit()
            },

            setAutoCacheEnabled: (value) => {
              set((state) => {
                state.settings.autoCacheEnabled = value
              })
            },
          },
        })),
        { name: 'song_cache_store' },
      ),
      {
        name: 'song_cache_store',
        version: 1,
        // The songs themselves live in IndexedDB and are read back on start;
        // only the preferences belong in local storage.
        partialize: (state) => ({
          settings: state.settings,
          collections: state.collections,
        }),
        merge: (persistedState, currentState) =>
          merge(currentState, persistedState),
      },
    ),
  ),
)

/**
 * Frees at least this many bytes by dropping the songs left unplayed the
 * longest. Songs saved on purpose are never among them, so a device filled
 * with pinned music reports back that it freed nothing.
 */
async function freeSpace(bytesNeeded: number) {
  const { entries, actions } = useSongCacheStore.getState()
  const evictions = selectLeastUsed(Object.values(entries), bytesNeeded)

  if (evictions.length === 0) return 0

  await actions.removeSongs(evictions.map((entry) => entry.id))

  return evictions.reduce((sum, entry) => sum + entry.size, 0)
}

/**
 * Stores a song, making room for it when the device says there is none. The
 * configured limit is only half the story: the browser hands out a quota of
 * its own, and hitting it has to clear space rather than fail.
 */
async function storeSong(id: string, blob: Blob, pinned: boolean) {
  for (let attempt = 0; attempt <= MAX_QUOTA_RETRIES; attempt++) {
    try {
      return await writeSong(id, blob, pinned)
    } catch (error) {
      if (!isQuotaError(error) || attempt === MAX_QUOTA_RETRIES) throw error

      const freed = await freeSpace(blob.size * QUOTA_HEADROOM)

      if (freed === 0) throw error

      logger.info('[songCache] - Freed space for a song', { id, freed })
    }
  }

  throw new Error('Unreachable')
}

async function evictOverLimit() {
  const { entries, settings } = useSongCacheStore.getState()
  const evictions = selectEvictions(Object.values(entries), settings.limitBytes)

  if (evictions.length === 0) return

  await useSongCacheStore
    .getState()
    .actions.removeSongs(evictions.map((entry) => entry.id))
}

export const useSongCacheActions = () =>
  useSongCacheStore((state) => state.actions)

export const useSongCacheEntries = () =>
  useSongCacheStore((state) => state.entries)

export const useSavedCollection = (id: string) =>
  useSongCacheStore((state) => state.collections[id])

export const useCacheJob = (id: string) =>
  useSongCacheStore((state) => state.jobs[id])

export const useSongCacheSettings = () =>
  useSongCacheStore((state) => state.settings)

export const useCachedSongCount = () =>
  useSongCacheStore((state) => Object.keys(state.entries).length)

export const useSongCacheSize = () =>
  useSongCacheStore((state) =>
    Object.values(state.entries).reduce((sum, entry) => sum + entry.size, 0),
  )

export const isSongCached = (id: string) =>
  useSongCacheStore.getState().entries[id] !== undefined
