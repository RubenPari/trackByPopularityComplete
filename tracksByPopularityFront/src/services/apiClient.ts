import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'
import { useApiStore } from '@/stores/api'
import i18n from '@/i18n'

const USER_KEY = 'auth_user'
const SPOTIFY_REDIRECT_GUARD_KEY = 'spotify_redirect_guard_at'
const GUEST_AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
])

let isSpotifyRedirectInProgress = false
let lastSpotifyRedirectAt = 0
const SPOTIFY_REDIRECT_COOLDOWN_MS = 5000

// Define the base URL from Vite env variables
// Empty string means relative URLs (e.g., behind a reverse proxy like nginx)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function normalizeRequestPath(requestUrl: string | undefined): string {
  if (!requestUrl) return ''

  try {
    const resolvedUrl = new URL(requestUrl, API_BASE_URL)
    return resolvedUrl.pathname
  } catch {
    return requestUrl
  }
}

function isGuestAuthPath(pathname: string): boolean {
  if (!pathname) return false

  if (GUEST_AUTH_PATHS.has(pathname)) return true

  return pathname.startsWith('/reset-password/') || pathname.startsWith('/verify-email/')
}

function isAppAuthenticated(): boolean {
  try {
    return !!localStorage.getItem(USER_KEY)
  } catch {
    return false
  }
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

  // Avoid redirecting when the user simply needs to re-authenticate to the app account.
  if (requestPath.startsWith('/api/account')) return false

  // Spotify-protected endpoints in this app.
  return (
    requestPath.startsWith('/api/track') ||
    requestPath.startsWith('/api/playlist') ||
    requestPath.startsWith('/api/backup') ||
    requestPath.startsWith('/track') ||
    requestPath.startsWith('/playlist')
  )
}

// Setup interceptors
apiClient.interceptors.request.use((config) => {
  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const apiStore = useApiStore()

    const t = i18n.global.t

    if (error.response) {
      const status = error.response.status

      // Handle known status codes
      if (status === 401 || status === 403) {
        const requestPath = normalizeRequestPath(error.config?.url)
        const spotifyProtectedRequest = shouldRedirectToSpotifyLogin(error.config?.url)
        const isAccountRequest = requestPath.startsWith('/api/account')
        const currentPathname = window.location.pathname
        const isOnGuestAuthRoute = isGuestAuthPath(currentPathname)

        if (!isAccountRequest || !isOnGuestAuthRoute) {
          apiStore.error = t('errors.authRequired')
        }

        const now = Date.now()
        const inMemoryCooldown = now - lastSpotifyRedirectAt < SPOTIFY_REDIRECT_COOLDOWN_MS
        const sessionGuardTimestamp = getSessionRedirectGuardTimestamp()
        const inSessionCooldown = now - sessionGuardTimestamp < SPOTIFY_REDIRECT_COOLDOWN_MS

        if (
          spotifyProtectedRequest &&
          isAppAuthenticated() &&
          !isOnGuestAuthRoute &&
          !isSpotifyRedirectInProgress &&
          !inMemoryCooldown &&
          !inSessionCooldown
        ) {
          isSpotifyRedirectInProgress = true
          lastSpotifyRedirectAt = now
          setSessionRedirectGuardTimestamp(now)

          // Fetch the Spotify login URL from the backend and redirect
          try {
            const loginResponse = await axios.get(`${API_BASE_URL}/auth/login`, {
              withCredentials: true,
            })
            const loginUrl = loginResponse.data?.data?.loginUrl
            if (loginUrl) {
              window.location.href = loginUrl
              return Promise.reject(error)
            }
          } catch {
            // Fallback: redirect to auth/login endpoint directly
            window.location.href = `${API_BASE_URL}/auth/login`
            return Promise.reject(error)
          } finally {
            // If navigation does not happen (eg popup blockers, network issues), allow future retries.
            setTimeout(() => {
              isSpotifyRedirectInProgress = false
            }, SPOTIFY_REDIRECT_COOLDOWN_MS)
          }
        }
      } else if (status === 500) {
        apiStore.error = t('errors.internalServer')
      } else {
        const data = error.response.data as { error?: string; message?: string } | undefined
        apiStore.error = data?.error || data?.message || t('errors.genericError')
      }
    } else if (error.request) {
      apiStore.error = t('errors.cannotConnect')
    } else {
      apiStore.error = t('errors.unexpectedError')
    }

    return Promise.reject(error)
  },
)
