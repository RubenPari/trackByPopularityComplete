import { computed } from 'vue'
import { trackApiService } from '@/services/trackApi'
import { useCachedApi } from './useCachedApi'
import type { ArtistSummary } from '@/types/api'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useCachedArtists')

const ARTISTS_CACHE_KEY = 'artists-cache'
const ARTISTS_STALE_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Composable for fetching and caching followed artists from user's library.
 * Uses SWR pattern for optimal UX.
 *
 * Benefits:
 * - Shows cached artists immediately for fast UI rendering
 * - Refreshes data in background
 * - Persists cache in localStorage
 *
 * @example
 * ```vue
 * <script setup>
 * const { artists, loading, isRevalidating, refresh } = useCachedArtists()
 * </script>
 * ```
 */
export function useCachedArtists() {
  const {
    data: artistsFromCache,
    loading,
    error,
    isRevalidating,
    lastUpdated,
    refresh,
    clearCache,
  } = useCachedApi<ArtistSummary[]>(
    async () => {
      logger.info('Fetching artists from API')
      const response = await trackApiService.getLibraryArtists()

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.error || 'Failed to fetch artists')
    },
    ARTISTS_CACHE_KEY,
    {
      staleTime: ARTISTS_STALE_TIME,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  )

  return {
    /** List of followed artists sorted by track count */
    artists: computed(() => artistsFromCache.value || []),
    /** Loading state for initial fetch */
    loading,
    /** Error state */
    error,
    /** Whether data is being refreshed in background */
    isRevalidating,
    /** Timestamp of last successful fetch */
    lastUpdated,
    /** Force a refresh */
    refresh,
    /** Clear local cache */
    clearCache,
  }
}
