import { computed } from 'vue'
import { useApiStore } from '@/stores/api'
import { trackApiService } from '@/services/trackApi'
import { SUCCESS_MESSAGES } from '@/utils/constants'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useTrackActions')

/**
 * Composable for track-related actions.
 * Separates business logic from presentation components, providing a clean API
 * for components to interact with track operations.
 *
 * @returns An object containing track action methods and loading state.
 * @example
 * ```vue
 * <script setup>
 * const { addTracksByPopularity, loading } = useTrackActions()
 * </script>
 * ```
 */
export function useTrackActions() {
  const apiStore = useApiStore()

  /**
   * Adds tracks to the designated playlist based on the specified popularity range.
   * @param playlistId - The Spotify playlist ID to add tracks to
   * @param range - The popularity range ('less', 'less-medium', 'medium', 'more-medium', 'more')
   * @param successMessage - The message to display upon success
   * @returns A promise that resolves with the API call result.
   */
  const addTracksByPopularity = async (range: string, successMessage: string) => {
    logger.info(`Adding tracks with ${range} popularity`)
    return apiStore.executeApiCall(
      () => trackApiService.addTracksByPopularity(range),
      successMessage,
    )
  }

  /**
   * Organizes tracks from a specific artist into three playlists based on popularity.
   * Creates playlists named "{artistName} less", "{artistName} medium", and "{artistName} more".
   *
   * @param artistId - The unique identifier of the artist (22 alphanumeric characters).
   * @returns A promise that resolves with the API call result.
   * @throws {Error} If the artist ID is invalid or the API call fails.
   */
  const addTracksByArtist = async (artistId: string) => {
    logger.info('Adding tracks by artist', { artistId })
    return apiStore.executeApiCall(
      () => trackApiService.addTracksByArtist(artistId),
      SUCCESS_MESSAGES.ARTIST_TRACKS_ADDED,
    )
  }

  return {
    /** Adds tracks with specified popularity to playlist */
    addTracksByPopularity,
    /** Organizes artist tracks into popularity-based playlists */
    addTracksByArtist,
    /** Reactive loading state indicating if any track operation is in progress */
    loading: computed(() => apiStore.loading),
  }
}
