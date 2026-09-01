import { ArrowDownToLine, CircleCheck, Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Actions } from '@/app/components/actions'
import {
  useCacheJob,
  useSavedCollection,
  useSongCacheActions,
} from '@/store/song-cache.store'
import { ISong } from '@/types/responses/song'

interface CollectionCacheButtonProps {
  /** Album, playlist or artist id; groups the download and remembers it. */
  collectionId: string
  /** The songs, when the page already has them. */
  songs?: ISong[]
  /** Fetches the songs for pages that do not list them, like an artist. */
  loadSongs?: () => Promise<ISong[]>
  disabled?: boolean
}

export function CollectionCacheButton({
  collectionId,
  songs,
  loadSongs,
  disabled = false,
}: CollectionCacheButtonProps) {
  const { t } = useTranslation()
  const { saveCollection, forgetCollection } = useSongCacheActions()
  const saved = useSavedCollection(collectionId)
  const job = useCacheJob(collectionId)
  const [isResolving, setIsResolving] = useState(false)

  const isSaved = saved !== undefined
  const isBusy = isResolving || job !== undefined

  const handleClick = useCallback(async () => {
    if (isBusy) return

    if (isSaved) {
      await forgetCollection(collectionId, songs ?? [])
      return
    }

    setIsResolving(true)

    try {
      const list = songs ?? (loadSongs ? await loadSongs() : [])

      if (list.length === 0) return

      await saveCollection(collectionId, list)
    } finally {
      setIsResolving(false)
    }
  }, [
    collectionId,
    forgetCollection,
    isBusy,
    isSaved,
    loadSongs,
    saveCollection,
    songs,
  ])

  const tooltip = isSaved
    ? t('songCache.collection.remove')
    : t('songCache.collection.save')

  const busyTooltip = job
    ? t('songCache.collection.progress', {
        done: job.done + job.failed,
        total: job.total,
      })
    : t('songCache.collection.preparing')

  return (
    <Actions.Button
      tooltip={isBusy ? busyTooltip : tooltip}
      onClick={handleClick}
      disabled={disabled || isBusy}
      data-testid="collection-cache-button"
    >
      {isBusy && <Loader2 className="w-5 h-5 animate-spin" />}
      {!isBusy && isSaved && (
        <CircleCheck className="w-5 h-5 text-primary fill-primary/20" />
      )}
      {!isBusy && !isSaved && <ArrowDownToLine className="w-5 h-5" />}
    </Actions.Button>
  )
}
