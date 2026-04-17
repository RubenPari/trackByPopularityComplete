import { apiClient } from './apiClient'
import type { ApiResponse, User, AccountLoginResponse, SpotifyLinkStatus } from '@/types/api'

export class AccountApiService {
  async register(email: string, password: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/api/account/register', {
      email,
      password,
    })
    return response.data
  }

  async login(email: string, password: string): Promise<ApiResponse<AccountLoginResponse>> {
    const response = await apiClient.post<ApiResponse<AccountLoginResponse>>('/api/account/login', {
      email,
      password,
    })
    return response.data
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await apiClient.get<ApiResponse>(`/api/account/verify/${token}`)
    return response.data
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/api/account/forgot-password', {
      email,
    })
    return response.data
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/api/account/reset-password', {
      token,
      newPassword,
    })
    return response.data
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/api/account/change-password', {
      oldPassword,
      newPassword,
    })
    return response.data
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/api/account/me')
    return response.data
  }

  async logout(): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/api/account/logout')
    return response.data
  }

  async getSpotifyLinkStatus(): Promise<ApiResponse<SpotifyLinkStatus>> {
    const response = await apiClient.get<ApiResponse<SpotifyLinkStatus>>('/api/spotify/status')
    return response.data
  }

  async getSpotifyLinkUrl(): Promise<ApiResponse<{ linkUrl: string }>> {
    const response = await apiClient.get<ApiResponse<{ linkUrl: string }>>('/api/spotify/link-url')
    return response.data
  }

  async unlinkSpotify(): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/api/spotify/unlink')
    return response.data
  }
}

export const accountApiService = new AccountApiService()
