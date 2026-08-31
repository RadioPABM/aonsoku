import CommandMenu from '@/app/components/command/command-menu'
import { AppSidebar } from '@/app/components/sidebar/app-sidebar'
import {
  MainSidebarInset,
  MainSidebarProvider,
} from '@/app/components/ui/main-sidebar'
import { MainRoutes } from '@/app/layout/main'
import { MobileBottomNav } from './bottom-nav'
import { MobileHeader } from './header'
import { MobileMiniPlayer } from './mini-player'

export function MobileShell() {
  return (
    <div className="h-[100dvh] w-screen overflow-hidden">
      <MainSidebarProvider className="pt-mobile-header pb-mobile-player">
        <MobileHeader />
        <AppSidebar />
        <CommandMenu hideTrigger />
        <MainSidebarInset className="w-full">
          <MainRoutes />
        </MainSidebarInset>

        <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col bg-background pb-mobile-safe-bottom">
          <MobileMiniPlayer />
          <MobileBottomNav />
        </div>
      </MainSidebarProvider>
    </div>
  )
}
