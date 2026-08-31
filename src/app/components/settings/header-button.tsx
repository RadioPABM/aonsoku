import { Settings } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { Button } from '@/app/components/ui/button'
import { SimpleTooltip } from '@/app/components/ui/simple-tooltip'
import { cn } from '@/lib/utils'
import { useAppSettings } from '@/store/app.store'

export function SettingsButton({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { openDialog, setOpenDialog } = useAppSettings()

  useHotkeys('mod+comma', () => {
    setOpenDialog(!openDialog)
  })

  return (
    <SimpleTooltip text={t('settings.label')} side="bottom">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenDialog(true)}
        className={cn('h-8 w-8 p-0 rounded-md', className)}
      >
        <Settings className="w-4 h-4" />
      </Button>
    </SimpleTooltip>
  )
}
