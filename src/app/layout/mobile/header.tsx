import { ChevronLeftIcon, MenuIcon } from 'lucide-react'
import { AppIcon } from '@/app/components/app-icon'
import { UserDropdown } from '@/app/components/header/user-dropdown'
import { SettingsButton } from '@/app/components/settings/header-button'
import { Button } from '@/app/components/ui/button'
import { useMainSidebar } from '@/app/components/ui/main-sidebar'
import { useAppWindow } from '@/app/hooks/use-app-window'
import useNavigationHistory from '@/app/hooks/use-navigation-history'
import { isLinux, isMacOS, isWindows } from '@/utils/desktop'

export function MobileHeader() {
  const { toggleMainSidebar } = useMainSidebar()
  const { canGoBack, goBack } = useNavigationHistory()
  const { isFullscreen } = useAppWindow()

  return (
    <header className="w-full h-mobile-header pt-mobile-safe-top flex items-center justify-between gap-1 px-2 fixed top-0 right-0 left-0 z-20 bg-background border-b electron-drag">
      <div className="flex items-center gap-1">
        {/* Room for the native window controls of a narrow desktop window */}
        {isMacOS && !isFullscreen && <div className="w-[70px]" />}
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          onClick={toggleMainSidebar}
        >
          <MenuIcon className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          disabled={!canGoBack}
          onClick={goBack}
        >
          <ChevronLeftIcon className="size-5" />
        </Button>
      </div>

      <div className="flex items-center justify-center flex-1 min-w-0">
        <AppIcon />
      </div>

      <div className="flex items-center gap-1">
        <SettingsButton className="size-10" />
        <UserDropdown className="size-10" />
        {isWindows && !isFullscreen && <div className="w-[122px]" />}
        {isLinux && !isFullscreen && <div className="w-[94px]" />}
      </div>
    </header>
  )
}
