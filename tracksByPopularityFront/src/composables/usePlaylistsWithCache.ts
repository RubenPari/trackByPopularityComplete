import { computed, type ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '@/stores/catalog'
import type { PlaylistInfo } from '@/types/api'

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
  const store = useCatalogStore()
  const { playlists, playlistsLoading, playlistsRefreshing, playlistsError } = storeToRefs(store)

  return {
    playlists: computed(() => playlists.value),
    loading: playlistsLoading,
    error: playlistsError,
    isRevalidating: playlistsRefreshing,
    initialize: store.initializePlaylists,
    forceRefresh: store.refreshPlaylists,
    clearCache: store.clearPlaylists,
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
