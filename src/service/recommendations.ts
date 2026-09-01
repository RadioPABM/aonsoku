import { ISong } from '@/types/responses/song'
import { logger } from '@/utils/logger'
import { artists } from './artists'
import { songs } from './songs'

/** How far around the song's own year a genre pick may wander. */
const YEAR_WINDOW = 5
const SIMILAR_ARTISTS = 4
const FETCH_SIZE = 40

/** Keeps a run of one artist from swallowing the whole batch. */
const MAX_PER_ARTIST = 2

type Source = (song: ISong) => Promise<ISong[]>

async function fromSimilarSongs(song: ISong) {
  return songs.getSimilarSongs(song.id, FETCH_SIZE)
}

async function fromSimilarArtists(song: ISong) {
  if (!song.artistId) return []

  const info = await artists.getInfo(song.artistId)
  const similar = info?.similarArtist?.slice(0, SIMILAR_ARTISTS) ?? []

  if (similar.length === 0) return []

  const lists = await Promise.all(
    similar.map((artist) => songs.getTopSongs(artist.name)),
  )

  return interleave(lists.map((list) => list ?? []))
}

async function fromSameArtist(song: ISong) {
  if (!song.artist) return []

  return (await songs.getTopSongs(song.artist)) ?? []
}

async function fromGenreAndYear(song: ISong) {
  if (!song.genre || !song.year) return []

  return (
    (await songs.getRandomSongs({
      size: FETCH_SIZE,
      genre: song.genre,
      fromYear: song.year - YEAR_WINDOW,
      toYear: song.year + YEAR_WINDOW,
    })) ?? []
  )
}

async function fromGenre(song: ISong) {
  if (!song.genre) return []

  return (
    (await songs.getRandomSongs({ size: FETCH_SIZE, genre: song.genre })) ?? []
  )
}

async function fromLibrary() {
  return (await songs.getRandomSongs({ size: FETCH_SIZE })) ?? []
}

/**
 * Tried in order, and only until one of them yields something new. Each step
 * is a blend of sources of comparable quality: the first asks the server what
 * it knows about taste, the second stays around the song itself, and the rest
 * exist so the queue is never left with nothing.
 */
const STRATEGIES: Source[][] = [
  [fromSimilarSongs, fromSimilarArtists],
  [fromSameArtist, fromGenreAndYear],
  [fromGenre],
  [fromLibrary],
]

/** Takes one from each list in turn, so no single source dominates. */
function interleave(lists: ISong[][]) {
  const merged: ISong[] = []
  const longest = Math.max(0, ...lists.map((list) => list.length))

  for (let index = 0; index < longest; index++) {
    for (const list of lists) {
      if (list[index]) merged.push(list[index])
    }
  }

  return merged
}

function pick(candidates: ISong[], exclude: Set<string>, limit: number) {
  const chosen: ISong[] = []
  const seen = new Set(exclude)
  const perArtist = new Map<string, number>()

  for (const song of candidates) {
    if (chosen.length >= limit) break
    if (seen.has(song.id)) continue

    const artistKey = song.artistId ?? song.artist ?? ''
    const used = perArtist.get(artistKey) ?? 0
    if (used >= MAX_PER_ARTIST) continue

    chosen.push(song)
    seen.add(song.id)
    perArtist.set(artistKey, used + 1)
  }

  return chosen
}

async function runStrategy(sources: Source[], song: ISong) {
  const results = await Promise.all(
    sources.map(async (source) => {
      try {
        return await source(song)
      } catch (error) {
        // One dead source must not sink the whole step; the others may still
        // answer, and the next step is there for when none of them do.
        logger.error('[recommendations] - A source failed', { error })

        return []
      }
    }),
  )

  return interleave(results)
}

interface GetRecommendedParams {
  /** Songs already queued, which must not be suggested again. */
  exclude: Set<string>
  limit: number
}

/**
 * Songs to play after this one. Falls through the strategies until one of
 * them offers something the queue does not already hold.
 */
export async function getRecommendedSongs(
  song: ISong,
  { exclude, limit }: GetRecommendedParams,
) {
  const excluded = new Set(exclude)
  excluded.add(song.id)

  for (const sources of STRATEGIES) {
    const candidates = await runStrategy(sources, song)
    const chosen = pick(candidates, excluded, limit)

    if (chosen.length > 0) return chosen
  }

  return []
}
