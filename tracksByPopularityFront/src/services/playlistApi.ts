import { httpClient } from './httpClient'
import type { ApiResponse, PlaylistInfo } from '@/types/api'
import { API_ENDPOINTS } from '@/utils/constants'

/**
 * API service for playlist-related operations
 * Provides methods to interact with playlist endpoints
 */
export class PlaylistApiService {
  /**
   * Retrieves all playlists owned by the current user
   */
  async getAllPlaylists(): Promise<ApiResponse<PlaylistInfo[]>> {
    return httpClient.get<PlaylistInfo[]>(API_ENDPOINTS.PLAYLIST.ALL)
  }
}

export const playlistApiService = new PlaylistApiService()
