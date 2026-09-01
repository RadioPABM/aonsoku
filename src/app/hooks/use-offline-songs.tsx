import { useCallback, useMemo } from 'react'
import {
  useSongCacheActions,
  useSongCacheStore,
} from '@/store/song-cache.store'
import { ISong } from '@/types/responses/song'

/**
 * Drives the offline entry of a song menu, for one song or for a selection.
 *
 * The state is read through boolean selectors rather than the whole index, so
 * a row menu only re-renders when its own songs change.
 */
export function useOfflineSongs(songs: ISong[]) {
  const { cacheSongs, removeSongs } = useSongCacheActions()

  const ids = useMemo(() => songs.map((song) => song.id), [songs])

  const isSaved = useSongCacheStore(
    (state) =>
      ids.length > 0 && ids.every((id) => state.entries[id] !== undefined),
  )
  const isBusy = useSongCacheStore((state) =>
    ids.some((id) => state.pending[id] === true),
  )

  const toggle = useCallback(async () => {
    if (isBusy || ids.length === 0) return

    if (isSaved) {
      await removeSongs(ids)
      return
    }

    // Saving from the menu is a deliberate act, so it is pinned and stays
    // until it is removed the same way.
    await cacheSongs(songs, { pinned: true })
  }, [cacheSongs, ids, isBusy, isSaved, removeSongs, songs])

  return { isSaved, isBusy, toggle }
}
