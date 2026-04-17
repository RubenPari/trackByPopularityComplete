import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'
import { useApiStore } from '@/stores/api'
import i18n from '@/i18n'

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

// Setup interceptors
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const spotifyUserId = localStorage.getItem('spotify_user_id')
  if (spotifyUserId) {
    config.headers['X-Spotify-User-Id'] = spotifyUserId
  }

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
        apiStore.error = t('errors.authRequired')
        // Fetch the Spotify login URL from the backend and redirect
        try {
          const loginResponse = await axios.get(`${API_BASE_URL}/auth/login`, {
            withCredentials: true,
          })
          const loginUrl = loginResponse.data?.data?.loginUrl
          if (loginUrl) {
            window.location.href = loginUrl
          }
        } catch {
          // Fallback: redirect to auth/login endpoint directly
          window.location.href = `${API_BASE_URL}/auth/login`
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
