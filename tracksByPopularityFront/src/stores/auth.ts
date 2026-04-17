import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountApiService } from '@/services/accountApi'
import type { User } from '@/types/api'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const spotifyLinked = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isEmailVerified = computed(() => user.value?.isEmailVerified ?? false)

  const setAuth = (newToken: string, newUser: User) => {
    token.value = newToken
    user.value = newUser
    spotifyLinked.value = newUser.isSpotifyLinked
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  const setSpotifyLinked = (linked: boolean) => {
    spotifyLinked.value = linked
    if (user.value) {
      user.value = { ...user.value, isSpotifyLinked: linked }
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    spotifyLinked.value = false
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('spotify_user_id')
  }

  const login = async (email: string, password: string) => {
    const response = await accountApiService.login(email, password)
    if (response.success && response.data) {
      setAuth(response.data.token, response.data.user)
      return { success: true }
    }
    return { success: false, error: response.error }
  }

  const register = async (email: string, password: string) => {
    return await accountApiService.register(email, password)
  }

  const logout = async () => {
    try {
      await accountApiService.logout()
    } catch {
      // Ignore errors during logout
    }
    clearAuth()
  }

  const checkAuth = async () => {
    if (!token.value) {
      return false
    }

    try {
      const response = await accountApiService.getCurrentUser()
      if (response.success && response.data) {
        user.value = response.data
        spotifyLinked.value = response.data.isSpotifyLinked
        return true
      }
    } catch {
      // Token might be expired or invalid
    }

    clearAuth()
    return false
  }

  const verifyEmail = async (token: string) => {
    return await accountApiService.verifyEmail(token)
  }

  const forgotPassword = async (email: string) => {
    return await accountApiService.forgotPassword(email)
  }

  const resetPassword = async (resetToken: string, newPassword: string) => {
    return await accountApiService.resetPassword(resetToken, newPassword)
  }

  const changePassword = async (oldPassword: string, newPassword: string) => {
    return await accountApiService.changePassword(oldPassword, newPassword)
  }

  const refreshSpotifyStatus = async () => {
    try {
      const response = await accountApiService.getSpotifyLinkStatus()
      if (response.success) {
        spotifyLinked.value = response.data?.isLinked ?? false
        if (user.value && response.data) {
          user.value = { ...user.value, isSpotifyLinked: response.data.isLinked }
          localStorage.setItem(USER_KEY, JSON.stringify(user.value))
        }
      }
    } catch {
      // Ignore errors
    }
  }

  return {
    token,
    user,
    spotifyLinked,
    isAuthenticated,
    isEmailVerified,
    setAuth,
    setSpotifyLinked,
    clearAuth,
    login,
    register,
    logout,
    checkAuth,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshSpotifyStatus,
  }
})
