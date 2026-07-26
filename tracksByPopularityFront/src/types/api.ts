/**
 * Base API response structure matching the backend ApiResponse
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  message?: string
  error?: string
  errorCode?: number
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Auth-related API responses
 */
export interface AuthStatusResponse {
  authenticated: boolean
  userId?: string
}

export interface LoginResponse {
  loginUrl: string
}

/**
 * Health check responses
 */
export interface HealthResponse {
  status: string
  timestamp: string
}

/**
 * Artist summary from user's library
 */
export interface ArtistSummary {
  id: string
  name: string
  count: number
}

/**
 * Playlist backup snapshot
 */
export interface PlaylistSnapshot {
  id: string
  playlistId: string
  playlistName: string
  operationType: string
  createdAt: string
  trackCount: number
}

/**
 * Playlist information from Spotify
 */
export interface PlaylistInfo {
  id: string
  name: string
  description?: string
  totalTracks: number
  uri?: string
}
