import { Capacitor } from '@capacitor/core'
import { MediaSession } from '@capgo/capacitor-media-session'
import { getSimpleCoverArtUrl } from '@/api/httpClient'
import { usePlayerStore } from '@/store/player.store'
import { EpisodeWithPodcast } from '@/types/responses/podcasts'
import { ISong } from '@/types/responses/song'
import { logger } from '@/utils/logger'

const artworkSizes = ['96', '128', '192', '256', '384', '512']

// On Android the WebView has no media session of its own, so the same calls
// are mirrored to the native plugin, which owns the playback notification.
const isNative = Capacitor.isNativePlatform()

type Metadata = {
  title: string
  artist: string
  album: string
  artwork: MediaImage[]
}

type MediaSessionActionName =
  | 'play'
  | 'pause'
  | 'stop'
  | 'previoustrack'
  | 'nexttrack'
  | 'seekbackward'
  | 'seekforward'
  | 'seekto'

type ActionCallback = (details: { seekTime?: number | null }) => void

function reportNativeError(action: string) {
  return (error: unknown) => {
    logger.error('[mediaSession] - Native call failed', { action, error })
  }
}

function applyMetadata(metadata: Metadata | null) {
  if (navigator.mediaSession) {
    navigator.mediaSession.metadata = metadata
      ? new MediaMetadata(metadata)
      : null
  }

  if (!isNative) return

  MediaSession.setMetadata(
    metadata ?? { title: '', artist: '', album: '', artwork: [] },
  ).catch(reportNativeError('setMetadata'))
}

function applyActionHandler(
  action: MediaSessionActionName,
  handler: ActionCallback | null,
) {
  if (navigator.mediaSession) {
    navigator.mediaSession.setActionHandler(action, handler)
  }

  if (!isNative) return

  MediaSession.setActionHandler({ action }, handler).catch(
    reportNativeError(`setActionHandler:${action}`),
  )
}

function getAudioElement() {
  return usePlayerStore.getState().playerState.audioPlayerRef
}

function seekBy(amount: number) {
  const audio = getAudioElement()
  if (!audio) return

  audio.currentTime += amount
}

function seekTo(time?: number | null) {
  const audio = getAudioElement()
  if (!audio || typeof time !== 'number') return

  audio.currentTime = time
}

function removeMediaSession() {
  applyMetadata(null)
}

function setMediaSession(song: ISong) {
  applyMetadata({
    title: song.title,
    artist: song.artist,
    album: song.album,
    artwork: artworkSizes.map((size): MediaImage => {
      return {
        src: getSimpleCoverArtUrl(song.coverArt, 'song', size),
        sizes: [size, size].join('x'),
        type: 'image/jpeg',
      }
    }),
  })
}

function setPodcastMediaSession(episode: EpisodeWithPodcast) {
  applyMetadata({
    title: episode.title,
    album: episode.podcast.title,
    artist: episode.podcast.author,
    artwork: [
      {
        src: episode.image_url,
        sizes: '',
        type: 'image/jpeg',
      },
    ],
  })
}

function setRadioMediaSession(label: string, radioName: string) {
  applyMetadata({
    title: radioName,
    artist: label,
    album: '',
    artwork: [],
  })
}

function setPlaybackState(state: boolean | null) {
  const playbackState = state === null ? 'none' : state ? 'playing' : 'paused'

  if (navigator.mediaSession) {
    navigator.mediaSession.playbackState = playbackState
  }

  if (!isNative) return

  MediaSession.setPlaybackState({ playbackState }).catch(
    reportNativeError('setPlaybackState'),
  )
}

interface PositionState {
  duration: number
  position: number
  playbackRate: number
}

/**
 * Feeds the scrubber the system controls draw. A position past the duration
 * throws in the browser implementation, so both values are sanitized here.
 */
function setPositionState({ duration, position, playbackRate }: PositionState) {
  if (!Number.isFinite(duration) || duration <= 0) return

  const safePosition = Math.min(Math.max(position, 0), duration)
  const safeRate = playbackRate > 0 ? playbackRate : 1

  if (navigator.mediaSession?.setPositionState) {
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: safePosition,
        playbackRate: safeRate,
      })
    } catch (error) {
      logger.error('[mediaSession] - Invalid position state', { error })
    }
  }

  if (!isNative) return

  MediaSession.setPositionState({
    duration,
    position: safePosition,
    playbackRate: safeRate,
  }).catch(reportNativeError('setPositionState'))
}

function setHandlers() {
  const { togglePlayPause, playNextSong, playPrevSong } =
    usePlayerStore.getState().actions

  applyActionHandler('seekbackward', () => seekBy(-15))
  applyActionHandler('seekforward', () => seekBy(30))
  applyActionHandler('seekto', ({ seekTime }) => seekTo(seekTime))
  applyActionHandler('play', () => togglePlayPause())
  applyActionHandler('pause', () => togglePlayPause())
  applyActionHandler('previoustrack', () => playPrevSong())
  applyActionHandler('nexttrack', () => playNextSong())
}

function setRadioHandlers() {
  const { togglePlayPause } = usePlayerStore.getState().actions

  applyActionHandler('seekbackward', null)
  applyActionHandler('seekforward', null)
  applyActionHandler('seekto', null)
  applyActionHandler('previoustrack', null)
  applyActionHandler('nexttrack', null)
  applyActionHandler('play', () => togglePlayPause())
  applyActionHandler('pause', () => togglePlayPause())
}

function setPodcastHandlers() {
  const { setPlayingState } = usePlayerStore.getState().actions

  applyActionHandler('previoustrack', null)
  applyActionHandler('nexttrack', null)
  applyActionHandler('play', () => setPlayingState(true))
  applyActionHandler('pause', () => setPlayingState(false))
  applyActionHandler('seekbackward', () => seekBy(-15))
  applyActionHandler('seekforward', () => seekBy(30))
  applyActionHandler('seekto', ({ seekTime }) => seekTo(seekTime))
}

export const manageMediaSession = {
  removeMediaSession,
  setMediaSession,
  setRadioMediaSession,
  setPodcastMediaSession,
  setPlaybackState,
  setPositionState,
  setHandlers,
  setRadioHandlers,
  setPodcastHandlers,
}
