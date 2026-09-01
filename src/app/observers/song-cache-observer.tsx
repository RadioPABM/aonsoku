import { useEffect } from 'react'
import { dropLegacyCache } from '@/cache/songs'
import { usePlayerStore } from '@/store/player.store'
import { useSongCacheStore } from '@/store/song-cache.store'
import { isMeteredConnection } from '@/utils/connection'

/** Half a song is enough to call it listened to. */
const LISTENED_RATIO = 0.5

export function SongCacheObserver() {
  useEffect(() => {
    useSongCacheStore.getState().actions.hydrate()

    // One-time sweep of what an earlier version left in the shared store.
    dropLegacyCache()
  }, [])

  useEffect(() => {
    let lastQueued: string | null = null

    const unsubscribe = usePlayerStore.subscribe(
      (state) => state.playerProgress.progress,
      (progress) => {
        const { autoCacheEnabled, autoCacheWifiOnly } =
          useSongCacheStore.getState().settings
        if (!autoCacheEnabled) return

        // Keeping a song means downloading it a second time, which is not
        // something to do on someone's mobile data without being asked.
        if (autoCacheWifiOnly && isMeteredConnection()) return

        const { mediaType, currentDuration } =
          usePlayerStore.getState().playerState
        if (mediaType !== 'song' || currentDuration <= 0) return

        const { currentList, currentSongIndex } =
          usePlayerStore.getState().songlist
        const song = currentList[currentSongIndex]
        if (!song || song.id === lastQueued) return

        if (progress / currentDuration < LISTENED_RATIO) return

        const { entries, pending, actions } = useSongCacheStore.getState()
        if (entries[song.id] || pending[song.id]) return

        // The audio element keeps no copy of what it streamed, so a song that
        // was listened to has to be fetched a second time to be kept.
        lastQueued = song.id
        actions.cacheSongs([song])
      },
    )

    return unsubscribe
  }, [])

  return null
}
