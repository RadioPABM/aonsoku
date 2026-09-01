import { useEffect, useMemo, useState } from 'react'
import { getSongStreamUrl } from '@/api/httpClient'
import { readSongBlob } from '@/cache/songs'
import { useAppMediaCache } from '@/store/app.store'
import { isSongCached, useSongCacheActions } from '@/store/song-cache.store'
import { ISong } from '@/types/responses/song'
import { ensureSupportForAlac } from '@/utils/alac'

/**
 * Resolves what the audio element should play: the local copy when there is
 * one, the server otherwise.
 *
 * The cache is consulted once per song, on purpose. A song that finishes
 * downloading while it is playing must keep the source it started with, or
 * swapping it would send playback back to the beginning.
 */
export function useSongSource(song: ISong | undefined) {
  const mediaCacheEnabled = useAppMediaCache()
  const { touch, removeSongs } = useSongCacheActions()
  const [blobUrl, setBlobUrl] = useState<string>()
  const [blobMissing, setBlobMissing] = useState(false)

  const songId = song?.id
  const playsFromCache = useMemo(
    () => (songId ? isSongCached(songId) : false),
    [songId],
  )

  const streamUrl = useMemo(() => {
    if (!songId || !song) return ''

    const cacheBustToken = mediaCacheEnabled ? undefined : Date.now().toString()

    return getSongStreamUrl(
      songId,
      undefined,
      ensureSupportForAlac(song.suffix),
      cacheBustToken,
    )
  }, [songId, song, mediaCacheEnabled])

  useEffect(() => {
    setBlobMissing(false)

    if (!songId || !playsFromCache) {
      setBlobUrl(undefined)
      return
    }

    let cancelled = false
    let objectUrl: string | undefined

    readSongBlob(songId).then((blob) => {
      if (cancelled) return

      if (!blob) {
        // The index claims a copy that is not there any more. Forget it and
        // let the server serve the song, rather than leaving the player with
        // no source at all and no way to say so.
        setBlobMissing(true)
        removeSongs([songId])
        return
      }

      objectUrl = URL.createObjectURL(blob)
      setBlobUrl(objectUrl)
      touch(songId)
    })

    return () => {
      cancelled = true
      setBlobUrl(undefined)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [songId, playsFromCache, touch, removeSongs])

  return playsFromCache && !blobMissing ? blobUrl : streamUrl
}
