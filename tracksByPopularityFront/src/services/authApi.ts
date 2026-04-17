import { httpClient } from './httpClient'
import type { ApiResponse, AuthStatusResponse, LoginResponse, CallbackResponse } from '@/types/api'
import { API_ENDPOINTS } from '@/utils/constants'

/**
 * API service for authentication-related operations
 */
export class AuthApiService {
  /**
   * Checks if the user is authenticated
   */
  async checkAuth(): Promise<ApiResponse<AuthStatusResponse>> {
    return httpClient.get<AuthStatusResponse>(API_ENDPOINTS.AUTH.STATUS)
  }

  /**
   * Gets the Spotify login URL
   */
  async getLoginUrl(): Promise<ApiResponse<LoginResponse>> {
    return httpClient.get<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN)
  }

  /**
   * Handles the OAuth callback
   */
  async handleCallback(code: string): Promise<ApiResponse<CallbackResponse>> {
    return httpClient.get<CallbackResponse>(
      `${API_ENDPOINTS.AUTH.CALLBACK}?code=${encodeURIComponent(code)}`,
    )
  }
}

export const authApiService = new AuthApiService()
