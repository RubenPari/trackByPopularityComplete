import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApiService } from '@/services/authApi'

const SPOTIFY_USER_ID_KEY = 'spotify_user_id'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const spotifyUserId = ref<string | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => isAuthenticated.value)

  const checkAuth = async (): Promise<boolean> => {
    loading.value = true
    try {
      const response = await authApiService.checkAuth()
      if (response.success && response.data?.authenticated) {
        isAuthenticated.value = true
        spotifyUserId.value = response.data.userId ?? localStorage.getItem(SPOTIFY_USER_ID_KEY)
        if (response.data.userId) {
          localStorage.setItem(SPOTIFY_USER_ID_KEY, response.data.userId)
        }
        return true
      }
    } catch (error) {
      // Session might be expired or invalid
      console.error('Auth check failed', error)
    } finally {
      loading.value = false
    }

    clearAuth()
    return false
  }

  const redirectToSpotifyLogin = async (): Promise<void> => {
    const response = await authApiService.getLoginUrl()
    if (response.success && response.data?.loginUrl) {
      window.location.href = response.data.loginUrl
      return
    }
    throw new Error('Unable to start Spotify login')
  }

  const logout = async (): Promise<void> => {
    try {
      await authApiService.logout()
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      clearAuth()
    }
  }

  const clearAuth = () => {
    isAuthenticated.value = false
    spotifyUserId.value = null
    localStorage.removeItem(SPOTIFY_USER_ID_KEY)
  }

  return {
    isAuthenticated,
    isLoggedIn,
    spotifyUserId,
    loading,
    checkAuth,
    redirectToSpotifyLogin,
    logout,
    clearAuth,
  }
})
