import { Row } from '@tanstack/react-table'
import { SongMenuOptions } from '@/app/components/song/menu-options'
import { TableActionButton } from '@/app/components/table/action-button'
import { TableLikeButton } from '@/app/components/table/like-button'
import { useAppStore } from '@/store/app.store'
import { ISong } from '@/types/responses/song'

interface SongTableActionsProps {
  row: Row<ISong>
}

export function SongTableActions({ row }: SongTableActionsProps) {
  const hideFavoritesSection = useAppStore().pages.hideFavoritesSection

  return (
    <div className="flex gap-1 items-center">
      {/* Desktop only: a long press opens the same menu on touch, and the
          row has better uses for the width. */}
      <div className="hidden md:block">
        <TableActionButton
          optionsMenuItems={
            <SongMenuOptions
              variant="dropdown"
              song={row.original}
              index={row.index}
            />
          }
        />
      </div>
      {!hideFavoritesSection && (
        <TableLikeButton
          type="song"
          entityId={row.original.id}
          starred={typeof row.original.starred === 'string'}
        />
      )}
    </div>
  )
}
