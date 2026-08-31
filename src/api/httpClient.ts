import omit from 'lodash/omit'
import { getCachedImage } from '@/cache/image'
import { useAppStore } from '@/store/app.store'
import { CoverArt } from '@/types/coverArtType'
import { AuthType } from '@/types/serverConfig'
import { appName } from '@/utils/appName'
import { logger } from '@/utils/logger'
import { publicAsset } from '@/utils/publicAsset'
import { saltWord } from '@/utils/salt'

export type QueryType = Record<string, string | number | undefined>

export interface FetchOptions extends RequestInit {
  query?: QueryType
}

type AuthParams = { u: string; t: string; s: string } | { u: string; p: string }

export function authQueryParams(
  username: string,
  password: string,
  authType: AuthType | null,
): AuthParams {
  if (authType === AuthType.TOKEN) {
    return {
      u: username ?? '',
      t: password ?? '',
      s: saltWord,
    }
  } else if (authType === AuthType.PASSWORD) {
    return {
      u: username ?? '',
      p: password ?? '',
    }
  }
  throw new Error('Invalid/unspecified auth type')
}

function queryParams() {
  const { username, password, authType, protocolVersion } =
    useAppStore.getState().data

  return {
    ...authQueryParams(username, password, authType),
    v: protocolVersion || '1.16.0',
    c: appName,
    f: 'json',
  }
}

function getUrl(path: string, options?: QueryType) {
  const serverUrl = useAppStore.getState().data.url
  const params = new URLSearchParams(queryParams())

  if (options) {
    Object.keys(options).forEach((key) => {
      const query = options[key]

      if (query !== undefined) {
        params.append(key, query.toString())
      }
    })
  }

  const queries = params.toString()
  const pathWithoutSlash = path.startsWith('/') ? path.substring(1) : path
  let url = `${serverUrl}/rest/${pathWithoutSlash}`
  url += path.includes('?') ? '&' : '?'
  url += queries

  return url
}

type SubsonicPayload = {
  status?: 'ok' | 'failed'
  error?: { code: number; message: string }
}

async function browserFetch<T>(
  url: string,
  options: RequestInit,
): Promise<{ count: number; data: T } | undefined> {
  const endpoint = url.split('?')[0]

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      logger.error('[httpClient] - Request failed', {
        endpoint,
        status: response.status,
      })
      return undefined
    }

    const data = await response.json()
    const payload = data['subsonic-response'] as SubsonicPayload

    // Subsonic answers with HTTP 200 even for auth and permission errors, so
    // the failures are only visible in the payload.
    if (payload?.status === 'failed') {
      logger.error('[httpClient] - Subsonic error', {
        endpoint,
        code: payload.error?.code,
        message: payload.error?.message,
      })
      return undefined
    }

    return {
      count: parseInt(response.headers.get('x-total-count') || '0', 10),
      data: payload as T,
    }
  } catch (error) {
    logger.error('[httpClient] - Error on request', { endpoint, error })
    return undefined
  }
}

export async function httpClient<T>(
  path: string,
  options: FetchOptions,
): Promise<{ count: number; data: T } | undefined> {
  try {
    const url = getUrl(path, options.query)
    const init = omit(options, 'query')

    return await browserFetch<T>(url, init)
  } catch (error) {
    logger.error('[httpClient] - Unable to build the request', error)
    return undefined
  }
}

export function getSimpleCoverArtUrl(
  id?: string,
  type: CoverArt = 'album',
  size = '300',
): string {
  if (!id) {
    // everything except artists uses the same default cover art
    const resolvedType = type === 'artist' ? 'artist' : 'album'
    return publicAsset(`default_${resolvedType}_art.png`)
  }

  return getUrl('getCoverArt', { id, size })
}

export async function getCoverArtUrl(
  id?: string,
  type: CoverArt = 'album',
  size = '300',
): Promise<string> {
  const url = getSimpleCoverArtUrl(id, type, size)

  if (!id) {
    return url
  }

  const { imagesCacheLayerEnabled } = useAppStore.getState().pages

  if (!imagesCacheLayerEnabled) {
    return url
  }

  return getCachedImage(url)
}

export function getSongStreamUrl(
  id: string,
  maxBitRate?: string,
  format?: string,
) {
  return getUrl('stream', {
    id,
    maxBitRate,
    format,
    estimateContentLength: 'true',
  })
}

export function getDownloadUrl(id: string, maxBitRate = '0', format = 'raw') {
  return getUrl('download', {
    id,
    maxBitRate,
    format,
  })
}

export function getShareUrl(id: string) {
  return getUrl('createShare', {
    id,
  })
}
