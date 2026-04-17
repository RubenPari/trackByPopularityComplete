/**
 * Base API response structure matching the backend ApiResponse
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errorCode?: number
}

/**
 * Track-related API responses
 */
export interface TrackResponse {
  message: string
}

/**
 * Playlist-related API responses
 */
export interface PlaylistResponse {
  message: string
}

/**
 * Auth-related API responses
 */
export interface AuthStatusResponse {
  authenticated: boolean
}

export interface LoginResponse {
  loginUrl: string
}

export interface CallbackResponse {
  message: string
  userId: string
}

/**
 * Health check responses
 */
export interface HealthResponse {
  status: string
  timestamp: string
}

export interface DetailedHealthResponse {
  status: string
  timestamp: string
  dependencies: {
    redis: {
      status: string
      message: string
    }
    spotify: {
      status: string
      message: string
    }
  }
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

/**
 * User account information
 */
export interface User {
  id: string
  email: string
  isEmailVerified: boolean
  isSpotifyLinked: boolean
}

/**
 * Account login response
 */
export interface AccountLoginResponse {
  token: string
  user: User
}

/**
 * Spotify link status
 */
export interface SpotifyLinkStatus {
  isLinked: boolean
  spotifyUserId?: string
}
