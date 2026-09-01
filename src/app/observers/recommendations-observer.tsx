import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'
import { getRecommendedSongs } from '@/service/recommendations'
import { usePlayerStore } from '@/store/player.store'
import { LoopState } from '@/types/playerContext'
import { logger } from '@/utils/logger'

const RECOMMENDED_COUNT = 20

/**
 * Keeps the queue going. Once the last song in it starts playing, songs the
 * server considers similar to that one are appended, so playback carries on
 * instead of stopping at the end of an album.
 */
export function RecommendationsObserver() {
  useEffect(() => {
    // The seed of the last extension, so a queue sitting on its final song
    // does not ask again on every state change.
    let lastSeedId: string | null = null
    let inFlight = false

    async function extendQueue() {
      const { settings, playerState, songlist } = usePlayerStore.getState()

      if (!settings.playback.autoplayRecommended) return
      if (playerState.mediaType !== 'song' || !playerState.isPlaying) return

      // A repeating queue never runs out, so there is nothing to extend.
      if (playerState.loopState !== LoopState.Off) return

      const { currentList, currentSongIndex } = songlist
      const song = currentList[currentSongIndex]

      if (!song || currentSongIndex !== currentList.length - 1) return
      if (inFlight || song.id === lastSeedId) return

      lastSeedId = song.id
      inFlight = true

      try {
        const recommended = await getRecommendedSongs(song, {
          exclude: new Set(currentList.map((queued) => queued.id)),
          limit: RECOMMENDED_COUNT,
        })

        if (recommended.length === 0) return

        // The queue may have moved on while the request was in flight.
        const current = usePlayerStore.getState().songlist
        if (current.currentList[current.currentSongIndex]?.id !== song.id) {
          return
        }

        usePlayerStore.getState().actions.appendToQueue(recommended)
      } catch (error) {
        logger.error('[recommendations] - Could not extend the queue', {
          id: song.id,
          error,
        })
      } finally {
        inFlight = false
      }
    }

    const unsubscribe = usePlayerStore.subscribe(
      (state) => [
        state.songlist.currentSongIndex,
        state.songlist.currentList.length,
        state.playerState.mediaType,
        state.playerState.isPlaying,
      ],
      () => {
        extendQueue()
      },
      { equalityFn: shallow },
    )

    extendQueue()

    return unsubscribe
  }, [])

  return null
}
