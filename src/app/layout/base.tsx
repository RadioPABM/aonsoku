import { memo } from 'react'
import CommandMenu from '@/app/components/command/command-menu'
import { MainDrawerPage } from '@/app/components/drawer/page'
import { MobileFullscreenMode } from '@/app/components/fullscreen/mobile-page'
import { FullscreenMode } from '@/app/components/fullscreen/page'
import { Player } from '@/app/components/player/player'
import { CreatePlaylistDialog } from '@/app/components/playlist/form-dialog'
import { RemovePlaylistDialog } from '@/app/components/playlist/remove-dialog'
import { AppSidebar } from '@/app/components/sidebar/app-sidebar'
import { SongInfoDialog } from '@/app/components/song/info-dialog'
import {
  MainSidebarInset,
  MainSidebarProvider,
} from '@/app/components/ui/main-sidebar'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { Header } from '@/app/layout/header'
import { cn } from '@/lib/utils'
import { MainRoutes } from './main'
import { MobileBottomNav } from './mobile/bottom-nav'
import { MobileHeader } from './mobile/header'
import { MobileMiniPlayer } from './mobile/mini-player'

const MemoHeader = memo(Header)
const MemoMobileHeader = memo(MobileHeader)
const MemoPlayer = memo(Player)
const MemoSongInfoDialog = memo(SongInfoDialog)
const MemoRemovePlaylistDialog = memo(RemovePlaylistDialog)
const MemoMainDrawerPage = memo(MainDrawerPage)
const MemoFullscreenMode = memo(FullscreenMode)
const MemoMobileFullscreenMode = memo(MobileFullscreenMode)

/**
 * One tree for both layouts. The two used to be separate shells swapped at the
 * breakpoint, which put the router outlet at a different position in a
 * different component type: crossing 768px tore the current page down and
 * built it again, losing scroll position, virtualiser state, table selection
 * and anything typed into a filter.
 *
 * The branches below therefore only ever swap what a slot holds, never how
 * many slots there are — a conditional that renders nothing still returns
 * null so the children after it keep their index and their state.
 */
export default function BaseLayout() {
  const isMobile = useIsMobile()

  return (
    <>
      <div
        className={cn(
          'w-screen overflow-hidden',
          isMobile ? 'h-[100dvh]' : 'h-screen',
        )}
      >
        <MainSidebarProvider
          className={cn(isMobile && 'pt-mobile-header pb-mobile-player')}
        >
          {isMobile ? <MemoMobileHeader /> : <MemoHeader />}
          <AppSidebar />
          {isMobile ? <CommandMenu hideTrigger /> : null}
          <MainSidebarInset className={cn(isMobile && 'w-full')}>
            <MainRoutes />
          </MainSidebarInset>
          {isMobile ? (
            <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col bg-background pb-mobile-safe-bottom">
              <MobileMiniPlayer />
              <MobileBottomNav />
            </div>
          ) : null}
        </MainSidebarProvider>
      </div>

      {/* Shared between both layouts, so playback survives a breakpoint change */}
      <MemoPlayer />
      <MemoSongInfoDialog />
      <MemoRemovePlaylistDialog />
      <CreatePlaylistDialog />

      {isMobile ? (
        <MemoMobileFullscreenMode />
      ) : (
        <>
          <MemoMainDrawerPage />
          <MemoFullscreenMode />
        </>
      )}
    </>
  )
}
