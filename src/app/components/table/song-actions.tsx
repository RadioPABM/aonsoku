import { Row } from '@tanstack/react-table'
import { SongMenuOptions } from '@/app/components/song/menu-options'
import { TableActionButton } from '@/app/components/table/action-button'
import { TableLikeButton } from '@/app/components/table/like-button'
import { ISong } from '@/types/responses/song'

interface SongTableActionsProps {
  row: Row<ISong>
}

export function SongTableActions({ row }: SongTableActionsProps) {
  return (
    <div className="flex gap-1 items-center">
      {/* The row menu is desktop only, it costs too much width on a phone */}
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
      <TableLikeButton
        type="song"
        entityId={row.original.id}
        starred={typeof row.original.starred === 'string'}
      />
    </div>
  )
}
