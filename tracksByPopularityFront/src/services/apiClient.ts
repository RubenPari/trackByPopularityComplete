import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'
import { useApiStore } from '@/stores/api'
import { ENV } from '@/config/env'
import i18n from '@/i18n'

const SPOTIFY_REDIRECT_GUARD_KEY = 'spotify_redirect_guard_at'

let isSpotifyRedirectInProgress = false
let lastSpotifyRedirectAt = 0
const SPOTIFY_REDIRECT_COOLDOWN_MS = 5000

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function normalizeRequestPath(requestUrl: string | undefined): string {
  if (!requestUrl) return ''

  try {
    const resolvedUrl = new URL(requestUrl, ENV.API_BASE_URL)
    return resolvedUrl.pathname
  } catch {
    return requestUrl
  }
}

function isGuestAuthPath(pathname: string): boolean {
  return pathname === '/login'
}

function getSessionRedirectGuardTimestamp(): number {

  try {
    const rawValue = sessionStorage.getItem(SPOTIFY_REDIRECT_GUARD_KEY)
    if (!rawValue) return 0

    const parsedValue = Number(rawValue)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  } catch {
    return 0
  }
}

function setSessionRedirectGuardTimestamp(timestamp: number): void {
  try {
    sessionStorage.setItem(SPOTIFY_REDIRECT_GUARD_KEY, String(timestamp))
  } catch {
    // Ignore sessionStorage access failures
  }
}

function shouldRedirectToSpotifyLogin(requestUrl: string | undefined): boolean {
  const requestPath = normalizeRequestPath(requestUrl)
  if (!requestPath) return false

  return (
    requestPath.startsWith('/api/track') ||
    requestPath.startsWith('/api/playlist') ||
    requestPath.startsWith('/api/backup')
  )
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const apiStore = useApiStore()
    const t = i18n.global.t

    if (error.response) {
      const status = error.response.status

      if (status === 401 || status === 403) {
        const spotifyProtectedRequest = shouldRedirectToSpotifyLogin(error.config?.url)
        const currentPathname = window.location.pathname
        const isOnGuestAuthRoute = isGuestAuthPath(currentPathname)

        apiStore.errors['global'] = t('errors.authRequired')

        const now = Date.now()
        const inMemoryCooldown = now - lastSpotifyRedirectAt < SPOTIFY_REDIRECT_COOLDOWN_MS
        const sessionGuardTimestamp = getSessionRedirectGuardTimestamp()
        const inSessionCooldown = now - sessionGuardTimestamp < SPOTIFY_REDIRECT_COOLDOWN_MS

        if (
          spotifyProtectedRequest &&
          !isOnGuestAuthRoute &&
          !isSpotifyRedirectInProgress &&
          !inMemoryCooldown &&
          !inSessionCooldown
        ) {
          isSpotifyRedirectInProgress = true
          lastSpotifyRedirectAt = now
          setSessionRedirectGuardTimestamp(now)

          try {
            const loginResponse = await axios.get(`${ENV.API_BASE_URL}/api/auth/login`, {
              withCredentials: true,
            })
            const loginUrl = loginResponse.data?.data?.loginUrl
            if (loginUrl) {
              window.location.href = loginUrl
              return Promise.reject(error)
            }
          } catch {
            window.location.href = `${ENV.API_BASE_URL}/api/auth/login`
            return Promise.reject(error)
          } finally {
            setTimeout(() => {
              isSpotifyRedirectInProgress = false
            }, SPOTIFY_REDIRECT_COOLDOWN_MS)
          }
        }
      } else if (status === 500) {
        apiStore.errors['global'] = t('errors.internalServer')
      } else {
        const data = error.response.data as { error?: string; message?: string } | undefined
        apiStore.errors['global'] = data?.error || data?.message || t('errors.genericError')
      }
    } else if (error.request) {
      apiStore.errors['global'] = t('errors.cannotConnect')
    } else {
      apiStore.errors['global'] = t('errors.unexpectedError')
    }

    return Promise.reject(error)
  },
)
