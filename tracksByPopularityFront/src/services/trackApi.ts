import { httpClient } from './httpClient'
import type { ApiResponse, TrackResponse, ArtistSummary } from '@/types/api'
import { API_ENDPOINTS } from '@/utils/constants'

/**
 * API service for track-related operations
 * Provides methods to interact with track endpoints
 */
export class TrackApiService {
  /**
   * Adds tracks to the system-managed playlist based on the specified popularity range.
   * Playlists are automatically created by the backend if they don't exist.
   * @param range - The popularity range ('less', 'less-medium', 'medium', 'more-medium', 'more')
   */
  async addTracksByPopularity(range: string): Promise<ApiResponse<TrackResponse>> {
    return httpClient.post<TrackResponse>(API_ENDPOINTS.TRACK.POPULARITY(range))
  }

  /**
   * Retrieves the list of followed artists from the user's library
   */
  async getLibraryArtists(): Promise<ApiResponse<ArtistSummary[]>> {
    return httpClient.get<ArtistSummary[]>(API_ENDPOINTS.TRACK.ARTISTS)
  }

  /**
   * Adds tracks by a specific artist to playlists based on popularity
   * @param artistId - The Spotify artist ID
   */
  async addTracksByArtist(artistId: string): Promise<ApiResponse<TrackResponse>> {
    return httpClient.post<TrackResponse>(
      `${API_ENDPOINTS.TRACK.ARTIST}?artistId=${encodeURIComponent(artistId)}`,
    )
  }
}

export const trackApiService = new TrackApiService()
