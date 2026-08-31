import clsx from 'clsx'
import { ChevronDownIcon, ListMusicIcon, MicVocalIcon } from 'lucide-react'
import { useState } from 'react'
import { ImageLoader } from '@/app/components/image-loader'
import { QueueSongList } from '@/app/components/queue/song-list'
import { Button } from '@/app/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/app/components/ui/drawer'
import { usePlayerCurrentSong, usePlayerFullscreen } from '@/store/player.store'
import { FullscreenBackdrop } from './backdrop'
import { buttonsStyle, FullscreenControls } from './controls'
import { LikeButton } from './like-button'
import { LyricsTab } from './lyrics'
import { MarqueeTitle } from './marquee-title'
import { FullscreenProgress } from './progress'

type MobileTab = 'cover' | 'lyrics' | 'queue'

export function MobileFullscreenMode() {
  const { isFullscreen, setIsFullscreen } = usePlayerFullscreen()
  const [tab, setTab] = useState<MobileTab>('cover')

  function toggleTab(value: MobileTab) {
    setTab((current) => (current === value ? 'cover' : value))
  }

  return (
    <Drawer
      open={isFullscreen}
      onOpenChange={setIsFullscreen}
      fixed={true}
      handleOnly={true}
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

          <div className="flex-1 min-h-0 flex items-center justify-center py-2">
            {tab === 'cover' && <MobileCover />}
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
            <LikeButton />

            <div className="flex items-center">
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
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function MobileCover() {
  const { coverArt, title, artist } = usePlayerCurrentSong()

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
  const { title, artist, album } = usePlayerCurrentSong()

  return (
    <div className="w-full flex flex-col overflow-hidden mt-4">
      <MarqueeTitle gap="mr-6">
        <h2 className="text-2xl font-bold tracking-tight text-shadow-md py-1">
          {title}
        </h2>
      </MarqueeTitle>
      <p className="text-sm text-foreground/70 truncate text-shadow-lg">
        {artist}
        {album ? ` • ${album}` : ''}
      </p>
    </div>
  )
}
