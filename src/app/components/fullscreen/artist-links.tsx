import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/routesList'
import { usePlayerFullscreen } from '@/store/player.store'
import { ISong } from '@/types/responses/song'
import { ALBUM_ARTISTS_MAX_NUMBER } from '@/utils/multipleArtists'

interface FullscreenArtistLinkProps {
  artistId?: string
  name: string
  className?: string
}

// The fullscreen player sits above the router outlet, so it has to step out of
// the way before the artist page it navigates to becomes visible.
export function FullscreenArtistLink({
  artistId,
  name,
  className,
}: FullscreenArtistLinkProps) {
  const { setIsFullscreen } = usePlayerFullscreen()

  if (!artistId) {
    return <span className={cn('truncate', className)}>{name}</span>
  }

  return (
    <Link
      to={ROUTES.ARTIST.PAGE(artistId)}
      className={cn('truncate hover:underline', className)}
      onClick={() => setIsFullscreen(false)}
      onContextMenu={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {name}
    </Link>
  )
}

interface FullscreenArtistLinksProps {
  song: ISong
  className?: string
}

export function FullscreenArtistLinks({
  song,
  className,
}: FullscreenArtistLinksProps) {
  const { artist, artistId, artists } = song

  if (artists && artists.length > 1) {
    const data = artists.slice(0, ALBUM_ARTISTS_MAX_NUMBER)

    return (
      <div className="flex items-center gap-1 truncate">
        {data.map(({ id, name }, index) => (
          <Fragment key={id}>
            <FullscreenArtistLink
              artistId={id}
              name={name}
              className={className}
            />
            {index < data.length - 1 && ','}
          </Fragment>
        ))}
      </div>
    )
  }

  return (
    <FullscreenArtistLink
      artistId={artistId}
      name={artist}
      className={className}
    />
  )
}
