import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CommandMenu from '@/app/components/command/command-menu'
import {
  MainSidebar,
  MainSidebarContent,
  MainSidebarHeader,
  MainSidebarRail,
  useMainSidebar,
} from '@/app/components/ui/main-sidebar'
import { MiniSidebarSearch } from './mini-search'
import { SidebarMiniSeparator } from './mini-separator'
import { MobileCloseButton } from './mobile-close-button'
import { NavLibrary } from './nav-library'
import { NavMain } from './nav-main'
import { NavPlaylists } from './nav-playlists'

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof MainSidebar>) {
  const { isMobile, setOpenMobile } = useMainSidebar()
  const { pathname } = useLocation()

  // On mobile the sidebar is a sheet covering the whole screen, so it has to be
  // dismissed once the user navigates somewhere.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers it
  useEffect(() => {
    if (isMobile) setOpenMobile(false)
  }, [pathname, isMobile, setOpenMobile])

  return (
    <MainSidebar collapsible="icon" {...props}>
      <MobileCloseButton />
      {!isMobile && (
        <MainSidebarHeader>
          <CommandMenu />
        </MainSidebarHeader>
      )}
      <MiniSidebarSearch />
      <NavMain />
      <SidebarMiniSeparator />
      <MainSidebarContent className="max-h-fit flex-none overflow-x-clip mb-2">
        <NavLibrary />
      </MainSidebarContent>
      <NavPlaylists />
      <MainSidebarRail />
    </MainSidebar>
  )
}
