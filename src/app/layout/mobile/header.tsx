import { ChevronLeftIcon, MenuIcon, SearchIcon } from 'lucide-react'
import { AppIcon } from '@/app/components/app-icon'
import { UserDropdown } from '@/app/components/header/user-dropdown'
import { SettingsButton } from '@/app/components/settings/header-button'
import { Button } from '@/app/components/ui/button'
import { useMainSidebar } from '@/app/components/ui/main-sidebar'
import useNavigationHistory from '@/app/hooks/use-navigation-history'
import { useAppStore } from '@/store/app.store'
import { useMainDrawerState } from '@/store/player.store'

export function MobileHeader() {
  const { toggleMainSidebar } = useMainSidebar()
  const { canGoBack, goBack } = useNavigationHistory()
  const { mainDrawerState } = useMainDrawerState()
  const setCommandOpen = useAppStore((state) => state.command.setOpen)

  return (
    <header className="w-full h-mobile-header flex items-center justify-between gap-1 px-2 fixed top-0 right-0 left-0 z-20 bg-background border-b">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          disabled={mainDrawerState}
          onClick={toggleMainSidebar}
        >
          <MenuIcon className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          disabled={!canGoBack || mainDrawerState}
          onClick={goBack}
        >
          <ChevronLeftIcon className="size-5" />
        </Button>
      </div>

      <div className="flex items-center justify-center flex-1 min-w-0">
        <AppIcon />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          onClick={() => setCommandOpen(true)}
        >
          <SearchIcon className="size-5" />
        </Button>
        <SettingsButton />
        <UserDropdown />
      </div>
    </header>
  )
}
