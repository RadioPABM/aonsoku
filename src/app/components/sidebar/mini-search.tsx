import { SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/app/components/ui/button'
import { useMainSidebar } from '@/app/components/ui/main-sidebar'
import { SimpleTooltip } from '@/app/components/ui/simple-tooltip'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app.store'

export function MiniSidebarSearch({
  className,
}: React.ComponentProps<typeof Button>) {
  const setOpen = useAppStore((state) => state.command.setOpen)
  const { t } = useTranslation()
  const { open: sidebarOpen, isMobile } = useMainSidebar()

  // On mobile the sheet has no command input of its own, so the button is
  // always needed; on desktop it only replaces the collapsed rail's input.
  if (sidebarOpen && !isMobile) {
    return null
  }

  return (
    <div className="w-full px-4 mt-4">
      <SimpleTooltip text={t('sidebar.miniSearch')} side="right" delay={50}>
        <Button
          variant="ghost"
          className={cn(
            'w-full mr-auto gap-2',
            'h-11 justify-start text-base',
            'md:h-fit md:flex-col md:justify-center md:items-center md:gap-1',
            className,
          )}
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="size-5 md:size-4" />
          <span className="md:hidden">{t('sidebar.miniSearch')}</span>
        </Button>
      </SimpleTooltip>
    </div>
  )
}
