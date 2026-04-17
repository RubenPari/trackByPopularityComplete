import { computed, type ComputedRef } from 'vue'
import { playlistApiService } from '@/services/playlistApi'
import { useCachedApi } from './useCachedApi'
import type { PlaylistInfo } from '@/types/api'
import { createLogger } from '@/utils/logger'

const logger = createLogger('usePlaylistsWithCache')

const CACHE_STALE_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Composable for managing user playlists with caching support.
 * Uses SWR (Stale-While-Revalidate) pattern for optimal UX.
 *
 * Benefits:
 * - Shows cached data immediately for fast UI rendering
 * - Refreshes data in background for fresh content
 * - Persists cache in localStorage for even faster subsequent loads
 *
 * @example
 * ```vue
 * <script setup>
 * const { playlists, loading, isRevalidating, refresh } = usePlaylistsWithCache()
 * </script>
 * ```
 */
export function usePlaylistsWithCache() {
  const {
    data: playlistsFromCache,
    loading,
    error,
    isRevalidating,
    lastUpdated,
    refresh,
    clearCache,
  } = useCachedApi<PlaylistInfo[]>(
    async () => {
      logger.info('Fetching playlists from API')
      const response = await playlistApiService.getAllPlaylists()

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.error || 'Failed to fetch playlists')
    },
    'playlists-cache',
    {
      staleTime: CACHE_STALE_TIME,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  )

  /**
   * Force refresh playlists
   */
  const forceRefresh = async (): Promise<void> => {
    clearCache()
    await refresh()
  }

  /**
   * Check if cache is stale
   */
  const isCacheStale = computed(() => {
    if (!lastUpdated.value) return true
    return Date.now() - lastUpdated.value > CACHE_STALE_TIME
  })

  return {
    /** List of user playlists (from cache or fresh) */
    playlists: computed(() => playlistsFromCache.value || []),
    /** Loading state for initial fetch */
    loading,
    /** Error state */
    error,
    /** Whether data is being refreshed in background */
    isRevalidating,
    /** Timestamp of last successful fetch */
    lastUpdated,
    /** Force a refresh */
    forceRefresh,
    /** Clear local cache */
    clearCache,
    /** Whether the cache is stale */
    isCacheStale,
  }
}

/**
 * Simplified version of usePlaylistsWithCache for components
 * that just need the playlist list
 */
export function useCachedPlaylists(): {
  playlists: ComputedRef<PlaylistInfo[]>
  loading: ReturnType<typeof usePlaylistsWithCache>['loading']
  isRevalidating: ReturnType<typeof usePlaylistsWithCache>['isRevalidating']
  forceRefresh: ReturnType<typeof usePlaylistsWithCache>['forceRefresh']
} {
  const { playlists, loading, isRevalidating, forceRefresh } = usePlaylistsWithCache()

  return {
    playlists,
    loading,
    isRevalidating,
    forceRefresh,
  }
}
