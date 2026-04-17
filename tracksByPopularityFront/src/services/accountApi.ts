import { httpClient } from './httpClient'
import type { ApiResponse, User, AccountLoginResponse, SpotifyLinkStatus } from '@/types/api'

export class AccountApiService {
  async register(email: string, password: string): Promise<ApiResponse> {
    return httpClient.post('/api/account/register', {
      email,
      password,
    })
  }

  async login(email: string, password: string): Promise<ApiResponse<AccountLoginResponse>> {
    return httpClient.post<AccountLoginResponse>('/api/account/login', {
      email,
      password,
    })
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return httpClient.get(`/api/account/verify/${token}`)
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return httpClient.post('/api/account/forgot-password', {
      email,
    })
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return httpClient.post('/api/account/reset-password', {
      token,
      newPassword,
    })
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    return httpClient.post('/api/account/change-password', {
      oldPassword,
      newPassword,
    })
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return httpClient.get<User>('/api/account/me')
  }

  async logout(): Promise<ApiResponse> {
    return httpClient.post('/api/account/logout')
  }

  async getSpotifyLinkStatus(): Promise<ApiResponse<SpotifyLinkStatus>> {
    return httpClient.get<SpotifyLinkStatus>('/api/spotify/status')
  }

  async getSpotifyLinkUrl(): Promise<ApiResponse<{ linkUrl: string }>> {
    return httpClient.get<{ linkUrl: string }>('/api/spotify/link-url')
  }

  async unlinkSpotify(): Promise<ApiResponse> {
    return httpClient.post('/api/spotify/unlink')
  }
}

export const accountApiService = new AccountApiService()
