import { useAppStore } from '@/store/app.store'
import { AuthType } from '@/types/serverConfig'
import { logger } from '@/utils/logger'
import { genEncodedPassword, genPasswordToken } from '@/utils/salt'

interface LoginResponse {
  id: string
  name: string
  username: string
  isAdmin: boolean
  token: string
}

export interface UserData {
  id: string
  name: string
  username: string
  email: string
  isAdmin: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

// Navidrome expects the whole user record back on PUT, so unknown fields are
// carried over untouched.
type UserRecord = UserData & Record<string, unknown>

function encodePassword(password: string) {
  const { authType } = useAppStore.getState().data

  return authType === AuthType.PASSWORD
    ? genEncodedPassword(password)
    : genPasswordToken(password)
}

/**
 * Changes the password of the logged in user through Navidrome's native API,
 * since the Subsonic API has no endpoint for it. The store only keeps a hashed
 * password, so the current one has to be supplied by the caller.
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<ApiResponse<UserData>> {
  try {
    const { url: serverUrl, username } = useAppStore.getState().data

    if (!username || !oldPassword) {
      return { success: false, message: 'userParams.error.userDataNotSet' }
    }

    const loginResponse = await fetch(`${serverUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: oldPassword }),
    })

    if (!loginResponse.ok) {
      return { success: false, message: 'userParams.error.wrongOldPassword' }
    }

    const { id, token } = (await loginResponse.json()) as LoginResponse

    const headers = {
      'Content-Type': 'application/json',
      'X-ND-Authorization': `Bearer ${token}`,
    }

    const userResponse = await fetch(`${serverUrl}/api/user/${id}`, {
      method: 'GET',
      headers,
    })

    if (!userResponse.ok) {
      return { success: false, message: 'userParams.error.userFetchError' }
    }

    const user = (await userResponse.json()) as UserRecord

    const updateResponse = await fetch(`${serverUrl}/api/user/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ...user,
        currentPassword: oldPassword,
        password: newPassword,
        changePassword: true,
      }),
    })

    if (!updateResponse.ok) {
      return {
        success: false,
        message: 'userParams.error.passwordChangeFailed',
      }
    }

    const userData = (await updateResponse.json()) as UserData

    // Replaces the credentials the Subsonic client signs its requests with.
    useAppStore.getState().actions.setPassword(encodePassword(newPassword))

    return {
      success: true,
      message: 'userParams.error.passwordChangeSuccess',
      data: userData,
    }
  } catch (error) {
    logger.error('Failed to change password', error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'userParams.error.unknownError',
    }
  }
}
