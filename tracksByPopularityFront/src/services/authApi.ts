import { httpClient } from './httpClient'
import type { ApiResponse, AuthStatusResponse, LoginResponse } from '@/types/api'
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
   * Logs the user out
   */
  async logout(): Promise<ApiResponse> {
    return httpClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  }
}

export const authApiService = new AuthApiService()
