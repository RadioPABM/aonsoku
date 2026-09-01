import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  usePlayerIsPlaying,
  usePlayerMediaType,
  usePlayerSonglist,
  usePlayerStore,
} from '@/store/player.store'
import { appName } from '@/utils/appName'
import { manageMediaSession } from '@/utils/setMediaSession'

const POSITION_UPDATE_INTERVAL = 1000

export function MediaSessionObserver() {
  const { t } = useTranslation()
  const isPlaying = usePlayerIsPlaying()
  const { isRadio, isSong, isPodcast } = usePlayerMediaType()
  const { currentList, radioList, currentSongIndex, podcastList } =
    usePlayerSonglist()
  const radioLabel = t('radios.label')

  const song = currentList[currentSongIndex] ?? null
  const radio = radioList[currentSongIndex] ?? null
  const episode = podcastList[currentSongIndex] ?? null

  const hasNothingPlaying =
    currentList.length === 0 &&
    radioList.length === 0 &&
    podcastList.length === 0

  const resetAppTitle = useCallback(() => {
    document.title = appName
  }, [])

  // The handlers are registered here rather than in the player controls: the
  // desktop control bar is not mounted on phones, where the system controls
  // matter most.
  useEffect(() => {
    if (isPodcast) {
      manageMediaSession.setPodcastHandlers()
      return
    }

    if (isRadio) {
      manageMediaSession.setRadioHandlers()
      return
    }

    manageMediaSession.setHandlers()
  }, [isPodcast, isRadio])

  useEffect(() => {
    manageMediaSession.setPlaybackState(isPlaying)

    if (hasNothingPlaying) {
      manageMediaSession.removeMediaSession()
      resetAppTitle()
      return
    }

    let title = ''

    if (isRadio && radio) {
      title = `${radioLabel} - ${radio.name}`
      manageMediaSession.setRadioMediaSession(radioLabel, radio.name)
    }
    if (isSong && song) {
      title = `${song.artist} - ${song.title}`
      manageMediaSession.setMediaSession(song)
    }
    if (isPodcast && episode) {
      title = `${episode.title} - ${episode.podcast.title}`
      manageMediaSession.setPodcastMediaSession(episode)
    }

    document.title = isPlaying ? title : appName
  }, [
    episode,
    hasNothingPlaying,
    isPlaying,
    isPodcast,
    isRadio,
    isSong,
    radio,
    radioLabel,
    song,
    resetAppTitle,
  ])

  // The system scrubber only needs a coarse position, so the store is read on
  // an interval instead of on every timeupdate.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a track change has to push the new position right away
  useEffect(() => {
    function pushPosition() {
      const { playerState, playerProgress } = usePlayerStore.getState()

      manageMediaSession.setPositionState({
        duration: playerState.currentDuration,
        position: playerProgress.progress,
        playbackRate: playerState.currentPlaybackRate,
      })
    }

    pushPosition()

    if (!isPlaying) return

    const interval = setInterval(pushPosition, POSITION_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [isPlaying, song, radio, episode])

  return null
}
