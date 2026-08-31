import { memo } from 'react'
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
import { MainRoutes } from './main'
import { MobileShell } from './mobile/base'

const MemoHeader = memo(Header)
const MemoPlayer = memo(Player)
const MemoSongInfoDialog = memo(SongInfoDialog)
const MemoRemovePlaylistDialog = memo(RemovePlaylistDialog)
const MemoMainDrawerPage = memo(MainDrawerPage)
const MemoFullscreenMode = memo(FullscreenMode)
const MemoMobileFullscreenMode = memo(MobileFullscreenMode)

export default function BaseLayout() {
  const isMobile = useIsMobile()

  return (
    <>
      {isMobile ? <MobileShell /> : <DesktopShell />}

      {/* Shared between both shells, so playback survives a breakpoint change */}
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

function DesktopShell() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <MainSidebarProvider>
        <MemoHeader />
        <AppSidebar />
        <MainSidebarInset>
          <MainRoutes />
        </MainSidebarInset>
      </MainSidebarProvider>
    </div>
  )
}
