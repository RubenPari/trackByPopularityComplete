import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '@/stores/catalog'

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
  const store = useCatalogStore()
  const { artists, artistsLoading, artistsRefreshing, artistsError } = storeToRefs(store)

  return {
    artists: computed(() => artists.value),
    loading: artistsLoading,
    error: artistsError,
    isRevalidating: artistsRefreshing,
    initialize: store.initializeArtists,
    refresh: store.refreshArtists,
    clearCache: store.clearArtists,
  }
}
