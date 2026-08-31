import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/app/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { useAppSettings } from '@/store/app.store'
import { settingsOptions } from './options'
import { Pages } from './pages'

export function SettingsMobileDialog() {
  const { t } = useTranslation()
  const { openDialog, setOpenDialog, currentPage, setCurrentPage } =
    useAppSettings()
  const [showPage, setShowPage] = useState(false)

  // Always start on the sections list when the dialog is reopened.
  useEffect(() => {
    if (!openDialog) setShowPage(false)
  }, [openDialog])

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent
        className="flex flex-col gap-0 p-0 inset-0 left-0 top-0 w-screen max-w-none h-[100dvh] max-h-none translate-x-0 translate-y-0 rounded-none border-0 sm:rounded-none [&>button]:hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{t('settings.label')}</DialogTitle>

        <header className="flex items-center gap-2 h-mobile-header min-h-mobile-header px-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full"
            onClick={() =>
              showPage ? setShowPage(false) : setOpenDialog(false)
            }
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
          <span className="font-medium truncate">
            {showPage
              ? t(`settings.options.${currentPage}`)
              : t('settings.label')}
          </span>
        </header>

        {showPage ? (
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="w-full p-4">
              <Pages />
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="flex flex-col p-2">
              {settingsOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-4 rounded-md text-left active:bg-accent/60 transition-colors"
                  onClick={() => {
                    setCurrentPage(item.id)
                    setShowPage(true)
                  }}
                >
                  <item.icon />
                  <span className="flex-1 truncate">
                    {t(`settings.options.${item.id}`)}
                  </span>
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
