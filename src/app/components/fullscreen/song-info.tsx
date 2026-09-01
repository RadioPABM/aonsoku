import { memo } from 'react'
import { Dot } from '@/app/components/dot'
import { MarqueeTitle } from '@/app/components/fullscreen/marquee-title'
import { SongQualityBadge } from '@/app/components/song/quality-badge'
import { Badge } from '@/app/components/ui/badge'
import { usePlayerStore } from '@/store/player.store'
import { FullscreenArtistLinks } from './artist-links'
import { FullscreenSongImage } from './song-image'

const MemoFullscreenSongImage = memo(FullscreenSongImage)

export function SongInfo() {
  const currentSong = usePlayerStore((state) => state.songlist.currentSong)

  return (
    <div className="flex items-center justify-start h-full min-h-full max-h-full gap-4 2xl:gap-6 flex-1 pt-2 overflow-hidden">
      <MemoFullscreenSongImage />

      <div className="flex flex-col w-[66%] max-w-full h-full max-h-[450px] 2xl:max-h-[550px] justify-end text-left overflow-hidden">
        <MarqueeTitle gap="mr-6">
          <h2 className="scroll-m-20 text-4xl 2xl:text-5xl font-bold tracking-tight py-2 2xl:py-3 text-shadow-md">
            {currentSong.title}
          </h2>
        </MarqueeTitle>
        <div className="text-base 2xl:text-lg flex gap-1 text-foreground/70 truncate maskImage-marquee-fade-finished">
          <p className="truncate text-shadow-lg text-foreground">
            {currentSong.album}
          </p>
          <Dot className="text-foreground/70" />
          <FullscreenArtistLinks
            song={currentSong}
            className="text-shadow-lg"
          />
        </div>
        <div className="flex gap-2 mt-2 2xl:mt-3 mb-[1px]">
          {currentSong.genre && (
            <Badge variant="neutral">{currentSong.genre}</Badge>
          )}
          {currentSong.year && (
            <Badge variant="neutral">{currentSong.year}</Badge>
          )}
          <SongQualityBadge song={currentSong} variant="neutral" />
        </div>
      </div>
    </div>
  )
}
