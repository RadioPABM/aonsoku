import { useEffect } from 'react'
import { usePlayerStore } from '@/store/player.store'
import { useSongCacheStore } from '@/store/song-cache.store'

/** Half a song is enough to call it listened to. */
const LISTENED_RATIO = 0.5

export function SongCacheObserver() {
  useEffect(() => {
    useSongCacheStore.getState().actions.hydrate()
  }, [])

  useEffect(() => {
    let lastQueued: string | null = null

    const unsubscribe = usePlayerStore.subscribe(
      (state) => state.playerProgress.progress,
      (progress) => {
        const { autoCacheEnabled } = useSongCacheStore.getState().settings
        if (!autoCacheEnabled) return

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
