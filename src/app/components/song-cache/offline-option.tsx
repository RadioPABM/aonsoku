import { OptionsButtons } from '@/app/components/options/buttons'
import { useOfflineSongs } from '@/app/hooks/use-offline-songs'
import { ISong } from '@/types/responses/song'

interface OfflineOptionProps {
  songs: ISong[]
  variant: 'context' | 'dropdown'
}

/** Saves the song, or the selection, for offline listening, and takes it back. */
export function OfflineOption({ songs, variant }: OfflineOptionProps) {
  const { isSaved, isBusy, toggle } = useOfflineSongs(songs)

  const Option = isSaved
    ? OptionsButtons.RemoveOffline
    : OptionsButtons.SaveOffline

  return (
    <Option
      variant={variant}
      disabled={isBusy || songs.length === 0}
      onClick={(e) => {
        e.stopPropagation()
        toggle()
      }}
    />
  )
}
