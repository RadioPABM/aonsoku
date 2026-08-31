import randomCSSHexColor from '@chriscodesthings/random-css-hex-color'
import { useCallback } from 'react'
import { useSongColor } from '@/store/player.store'
import { getAverageColor } from '@/utils/getAverageColor'
import { logger } from '@/utils/logger'

export const songImageId = 'track-song-image'

/**
 * Extracts the average color of the playing song's cover, which the queue and
 * the big player use as their background. The image lives in the player bar on
 * desktop and in the mini player on mobile, so only one of them is mounted.
 */
export function useSongImageColor() {
  const { setCurrentSongColor, currentSongColor } = useSongColor()

  const getImageElement = useCallback(() => {
    return document.getElementById(songImageId) as HTMLImageElement | null
  }, [])

  const getImageColor = useCallback(async () => {
    const img = getImageElement()
    if (!img) return

    let color = randomCSSHexColor(true)

    try {
      color = (await getAverageColor(img)).hex
      logger.info('[SongImageColor] - Getting Image Average Color', { color })
    } catch {
      logger.error('[SongImageColor] - Unable to get image average color.')
    }

    if (color !== currentSongColor) {
      setCurrentSongColor(color)
    }
  }, [currentSongColor, setCurrentSongColor, getImageElement])

  const handleError = useCallback(() => {
    const img = getImageElement()
    if (!img) return

    img.crossOrigin = null
  }, [getImageElement])

  return { getImageColor, handleError }
}
