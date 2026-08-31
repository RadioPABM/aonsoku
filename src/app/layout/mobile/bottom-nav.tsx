import {
  HeartIcon,
  HomeIcon,
  LibraryIcon,
  ListMusicIcon,
  SearchIcon,
} from 'lucide-react'
import { ElementType } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/routesList'
import { useAppStore } from '@/store/app.store'

interface MobileNavItem {
  id: string
  title: string
  icon: ElementType
  route?: string
}

const items: MobileNavItem[] = [
  {
    id: 'home',
    title: 'sidebar.home',
    icon: HomeIcon,
    route: ROUTES.LIBRARY.HOME,
  },
  {
    id: 'albums',
    title: 'sidebar.albums',
    icon: LibraryIcon,
    route: ROUTES.LIBRARY.ALBUMS,
  },
  {
    id: 'search',
    title: 'sidebar.miniSearch',
    icon: SearchIcon,
  },
  {
    id: 'playlists',
    title: 'sidebar.playlists',
    icon: ListMusicIcon,
    route: ROUTES.LIBRARY.PLAYLISTS,
  },
  {
    id: 'favorites',
    title: 'sidebar.favorites',
    icon: HeartIcon,
    route: ROUTES.LIBRARY.FAVORITES,
  },
]

export function MobileBottomNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const setCommandOpen = useAppStore((state) => state.command.setOpen)

  function isActive(route?: string) {
    if (!route) return false
    if (route === ROUTES.LIBRARY.HOME) return pathname === route

    return pathname.startsWith(route)
  }

  return (
    <nav className="w-full h-mobile-nav flex items-stretch border-t bg-background">
      {items.map(({ id, title, icon: Icon, route }) => {
        const active = isActive(route)

        return (
          <button
            key={id}
            type="button"
            aria-label={t(title)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 px-1',
              'text-muted-foreground active:bg-accent/50 transition-colors',
              active && 'text-primary',
            )}
            onClick={() => (route ? navigate(route) : setCommandOpen(true))}
          >
            <Icon className="size-5 shrink-0" />
            <span className="text-[10px] leading-none truncate max-w-full">
              {t(title)}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
