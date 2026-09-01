import clsx from 'clsx'
import { ChevronDownIcon, ListMusicIcon, MicVocalIcon } from 'lucide-react'
import { useState } from 'react'
import { Dot } from '@/app/components/dot'
import { ImageLoader } from '@/app/components/image-loader'
import { PodcastPlaybackRate } from '@/app/components/player/podcast-playback-rate'
import { QueueSongList } from '@/app/components/queue/song-list'
import { Button } from '@/app/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/app/components/ui/drawer'
import { useSwipe } from '@/app/hooks/use-swipe'
import {
  usePlayerActions,
  usePlayerCurrentSong,
  usePlayerFullscreen,
  usePlayerMediaType,
  usePlayerPrevAndNext,
  usePlayerSonglist,
} from '@/store/player.store'
import { publicAsset } from '@/utils/publicAsset'
import { FullscreenArtistLinks } from './artist-links'
import { FullscreenBackdrop } from './backdrop'
import { buttonsStyle, FullscreenControls } from './controls'
import { LikeButton } from './like-button'
import { LyricsTab } from './lyrics'
import { MarqueeTitle } from './marquee-title'
import { FullscreenProgress } from './progress'

type MobileTab = 'cover' | 'lyrics' | 'queue'

export function MobileFullscreenMode() {
  const { isFullscreen, setIsFullscreen } = usePlayerFullscreen()
  const { isSong, isPodcast } = usePlayerMediaType()
  const { playNextSong, playPrevSong } = usePlayerActions()
  const { hasPrev, hasNext } = usePlayerPrevAndNext()
  const [tab, setTab] = useState<MobileTab>('cover')

  function toggleTab(value: MobileTab) {
    setTab((current) => (current === value ? 'cover' : value))
  }

  // Swiping the artwork sideways walks the queue, the way every phone player
  // behaves. Lyrics and queue keep their own scrolling.
  const { offset, isSwiping, handlers } = useSwipe({
    onSwipeLeft: () => hasNext && playNextSong(),
    onSwipeRight: () => hasPrev && playPrevSong(),
    disabled: tab !== 'cover',
  })

  return (
    <Drawer
      open={isFullscreen}
      onOpenChange={setIsFullscreen}
      fixed={true}
      handleOnly={false}
      disablePreventScroll={true}
      dismissible={true}
      modal={false}
    >
      <DrawerTitle className="sr-only">Player</DrawerTitle>
      <DrawerContent
        className="h-[100dvh] w-screen rounded-t-none border-none select-none mt-0"
        showHandle={false}
        aria-describedby={undefined}
      >
        <FullscreenBackdrop />

        <div className="absolute inset-0 z-10 flex flex-col px-5 pt-2 pb-[calc(1rem+var(--mobile-safe-bottom))] bg-black/0">
          {/* Grabber: the sheet can also be swiped down to close */}
          <div className="mx-auto mb-1 h-1.5 w-10 shrink-0 rounded-full bg-foreground/30" />

          <div className="h-12 min-h-12 flex items-center justify-start">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full hover:bg-foreground/20"
              onClick={() => setIsFullscreen(false)}
            >
              <ChevronDownIcon className="size-6" />
            </Button>
          </div>

          <div
            className="flex-1 min-h-0 flex items-center justify-center py-2"
            {...handlers}
          >
            {tab === 'cover' && (
              <div
                className="w-full flex items-center justify-center"
                style={{
                  transform: `translate3d(${offset}px, 0, 0)`,
                  transition: isSwiping ? 'none' : 'transform 200ms ease-out',
                }}
              >
                <MobileCover />
              </div>
            )}
            {tab === 'lyrics' && (
              <div className="w-full h-full overflow-hidden">
                <LyricsTab />
              </div>
            )}
            {tab === 'queue' && (
              <div className="w-full h-full overflow-hidden">
                <QueueSongList />
              </div>
            )}
          </div>

          <MobileSongInfo />

          <div className="mt-3">
            <FullscreenProgress />
          </div>

          <div className="flex items-center justify-center gap-1 mt-2">
            <FullscreenControls />
          </div>

          <div className="flex items-center justify-between mt-2">
            {isSong ? <LikeButton /> : <div />}

            <div className="flex items-center gap-2">
              {isPodcast && <PodcastPlaybackRate />}
              {isSong && (
                <>
                  <TabButton
                    active={tab === 'lyrics'}
                    onClick={() => toggleTab('lyrics')}
                  >
                    <MicVocalIcon className={buttonsStyle.secondaryIcon} />
                  </TabButton>
                  <TabButton
                    active={tab === 'queue'}
                    onClick={() => toggleTab('queue')}
                  >
                    <ListMusicIcon className={buttonsStyle.secondaryIcon} />
                  </TabButton>
                </>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function MobileCover() {
  const { isPodcast } = usePlayerMediaType()
  const { podcastList, currentSongIndex } = usePlayerSonglist()
  const { coverArt, title, artist } = usePlayerCurrentSong()

  const podcast = podcastList[currentSongIndex]

  if (isPodcast) {
    return (
      <div className="w-full max-w-[min(100%,70vh)] aspect-square rounded-lg overflow-hidden bg-accent/60 shadow-custom-5">
        <img
          src={podcast?.image_url || publicAsset('default_podcast_art.png')}
          alt={podcast?.title}
          className="size-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[min(100%,70vh)] aspect-square rounded-lg overflow-hidden bg-accent/60 shadow-custom-5">
      <ImageLoader id={coverArt} type="song" size={800}>
        {(src, isLoading) => (
          <img
            src={src}
            alt={`${artist} - ${title}`}
            className={clsx(
              'size-full object-cover transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
            )}
          />
        )}
      </ImageLoader>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      data-state={active && 'active'}
      className={clsx(buttonsStyle.secondary, active && 'text-primary')}
      style={{ ...buttonsStyle.style }}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function MobileSongInfo() {
  const { isPodcast } = usePlayerMediaType()
  const { podcastList, currentSongIndex } = usePlayerSonglist()
  const currentSong = usePlayerCurrentSong()
  const { title, album } = currentSong

  const podcast = podcastList[currentSongIndex]

  const mainTitle = isPodcast ? podcast?.title : title

  return (
    <div className="w-full flex flex-col overflow-hidden mt-4">
      <MarqueeTitle gap="mr-6">
        <h2 className="text-2xl font-bold tracking-tight text-shadow-md py-1">
          {mainTitle}
        </h2>
      </MarqueeTitle>
      {isPodcast ? (
        <p className="text-sm text-foreground/70 truncate text-shadow-lg">
          {podcast?.podcast.title}
        </p>
      ) : (
        <div className="flex items-center gap-1 text-sm text-foreground/70 truncate text-shadow-lg">
          <FullscreenArtistLinks song={currentSong} />
          {album && (
            <>
              <Dot />
              <span className="truncate">{album}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
