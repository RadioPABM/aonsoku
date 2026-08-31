import { AudioLines, Pause, Play, RadioIcon, SkipForward } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ImageLoader } from '@/app/components/image-loader'
import { Button } from '@/app/components/ui/button'
import {
  songImageId,
  useSongImageColor,
} from '@/app/hooks/use-song-image-color'
import { cn } from '@/lib/utils'
import {
  usePlayerActions,
  usePlayerDuration,
  usePlayerFullscreen,
  usePlayerIsPlaying,
  usePlayerLoop,
  usePlayerMediaType,
  usePlayerPrevAndNext,
  usePlayerProgress,
  usePlayerSonglist,
} from '@/store/player.store'
import { LoopState } from '@/types/playerContext'
import { EpisodeWithPodcast } from '@/types/responses/podcasts'
import { ISong } from '@/types/responses/song'
import { publicAsset } from '@/utils/publicAsset'

const podcastPlaceholder = publicAsset('default_podcast_art.png')

export function MobileMiniPlayer() {
  const { t } = useTranslation()
  const { currentList, currentSongIndex, radioList, podcastList } =
    usePlayerSonglist()
  const { isSong, isRadio, isPodcast } = usePlayerMediaType()
  const isPlaying = usePlayerIsPlaying()
  const loopState = usePlayerLoop()
  const { hasNext } = usePlayerPrevAndNext()
  const { togglePlayPause, playNextSong } = usePlayerActions()
  const { setIsFullscreen } = usePlayerFullscreen()
  const progress = usePlayerProgress()
  const duration = usePlayerDuration()

  const song = currentList[currentSongIndex]
  const radio = radioList[currentSongIndex]
  const podcast = podcastList[currentSongIndex]

  const isEmpty = !song && !radio && !podcast
  const percentage = duration > 0 ? (progress / duration) * 100 : 0

  const title = isRadio
    ? radio?.name
    : isPodcast
      ? podcast?.title
      : (song?.title ?? t('player.noSongPlaying'))

  const subtitle = isRadio
    ? t('radios.label')
    : isPodcast
      ? podcast?.podcast.title
      : song?.artist

  return (
    <div className="w-full h-mobile-mini-player relative bg-background border-t">
      {(isSong || isPodcast) && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      <div className="w-full h-full flex items-center gap-3 pl-2 pr-1">
        <button
          type="button"
          disabled={isEmpty}
          onClick={() => (isSong || isPodcast) && setIsFullscreen(true)}
          className="flex items-center gap-3 flex-1 min-w-0 h-full text-left disabled:opacity-100"
        >
          <MiniCover song={song} podcast={podcast} isRadio={isRadio} />

          <div className="flex flex-col justify-center min-w-0">
            <span className="text-sm font-medium truncate">{title}</span>
            {subtitle && (
              <span className="text-xs text-muted-foreground truncate">
                {subtitle}
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            disabled={isEmpty}
            aria-label={
              isPlaying ? t('player.tooltips.pause') : t('player.tooltips.play')
            }
            onClick={() => togglePlayPause()}
          >
            {isPlaying ? (
              <Pause className="size-5 fill-foreground" />
            ) : (
              <Play className="size-5 fill-foreground" />
            )}
          </Button>
          {!isRadio && (
            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-full"
              disabled={!hasNext && loopState !== LoopState.All}
              aria-label={t('player.tooltips.next')}
              onClick={() => playNextSong()}
            >
              <SkipForward className="size-5 fill-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface MiniCoverProps {
  song?: ISong
  podcast?: EpisodeWithPodcast
  isRadio: boolean
}

function MiniCover({ song, podcast, isRadio }: MiniCoverProps) {
  const { getImageColor, handleError } = useSongImageColor()

  const baseClass =
    'size-11 min-w-11 rounded overflow-hidden bg-muted flex items-center justify-center shadow-sm'

  if (isRadio) {
    return (
      <div className={baseClass}>
        <RadioIcon className="size-6" strokeWidth={1.5} />
      </div>
    )
  }

  if (podcast) {
    return (
      <div className={baseClass}>
        <img
          src={podcast.image_url || podcastPlaceholder}
          alt={podcast.title}
          className="size-full object-cover"
        />
      </div>
    )
  }

  if (!song) {
    return (
      <div className={baseClass}>
        <AudioLines className="size-5" />
      </div>
    )
  }

  return (
    <div className={baseClass}>
      <ImageLoader id={song.coverArt} type="song" size={400}>
        {(src, isLoading) => (
          <img
            key={song.id}
            id={songImageId}
            src={src}
            alt={song.title}
            crossOrigin="anonymous"
            className={cn(
              'size-full object-cover transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
            )}
            onLoad={getImageColor}
            onError={handleError}
          />
        )}
      </ImageLoader>
    </div>
  )
}
