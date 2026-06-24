/**
 * Application-wide constants
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  TRACK: {
    BASE: '/api/track',
    POPULARITY: (range: string) => `/api/track/popularity/${range}`,
    ARTISTS: '/api/track/artists',
    ARTIST: '/api/track/artist',
  },
  PLAYLIST: {
    ALL: '/api/playlist/all',
    REFRESH: '/api/playlist/refresh',
  },
  AUTH: {
    STATUS: '/api/auth/is-auth',
    LOGIN: '/api/auth/login',
    CALLBACK: '/api/auth/callback',
    LOGOUT: '/api/auth/logout',
  },
  HEALTH: {
    BASE: '/api/health',
  },
  BACKUP: {
    LIST: '/api/backup/list',
    RESTORE: (snapshotId: string) => `/api/backup/restore/${snapshotId}`,
    DELETE: (snapshotId: string) => `/api/backup/${snapshotId}`,
  },
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'errors.unauthorized',
  BAD_REQUEST: 'errors.badRequest',
  NOT_FOUND: 'errors.notFound',
  SERVER_ERROR: 'errors.serverError',
  CONNECTION_ERROR: 'errors.connectionError',
  UNKNOWN_ERROR: 'errors.unknownError',
  NETWORK_ERROR: 'errors.networkError',
} as const

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  TRACKS_ADDED_LESS: 'success.tracksAddedLess',
  TRACKS_ADDED_LESS_MEDIUM: 'success.tracksAddedLessMedium',
  TRACKS_ADDED_MEDIUM: 'success.tracksAddedMedium',
  TRACKS_ADDED_MORE_MEDIUM: 'success.tracksAddedMoreMedium',
  TRACKS_ADDED_MORE: 'success.tracksAddedMore',
  ARTIST_TRACKS_ADDED: 'success.artistTracksAdded',
  OPERATION_SUCCESS: 'success.operationSuccess',
} as const

/**
 * Validation constants
 */
export const VALIDATION = {
  SPOTIFY_ID_LENGTH: 22,
  SPOTIFY_ID_PATTERN: /^[a-zA-Z0-9]+$/,
} as const

/**
 * API configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  TIMEOUT: 30000, // 30 seconds
} as const
