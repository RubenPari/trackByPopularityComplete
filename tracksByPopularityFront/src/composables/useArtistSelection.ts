import { ref, computed, watch, onUnmounted } from 'vue'
import type { ArtistSummary } from '@/types/api'
import { useCachedArtists } from './useCachedArtists'

// Module-level state for shared artist selection
let currentArtists: ArtistSummary[] = []
const subscribers = new Set<(artists: ArtistSummary[]) => void>()

/**
 * Notify all subscribers that artists have changed
 */
const notifySubscribers = (artists: ArtistSummary[]): void => {
  currentArtists = artists
  subscribers.forEach((callback) => callback(artists))
}

export function useArtistSelection() {
  const {
    artists: cachedArtists,
    loading: artistsLoading,
    isRevalidating,
    refresh,
    clearCache,
  } = useCachedArtists()

  const artists = ref<ArtistSummary[]>(currentArtists)
  const searchQuery = ref('')
  const selectedArtist = ref<ArtistSummary | null>(null)
  const loadingArtists = ref(artistsLoading.value)
  const fetchError = ref<string | null>(null)

  // Subscribe to cache updates
  const handleCacheUpdate = (newArtists: ArtistSummary[]): void => {
    artists.value = newArtists
  }
  subscribers.add(handleCacheUpdate)

  // Watch for cache changes
  watch(
    cachedArtists,
    (newArtists) => {
      if (newArtists.length > 0) {
        artists.value = newArtists
        notifySubscribers(newArtists)
      }
    },
    { immediate: true },
  )

  // Watch for loading state changes
  watch(artistsLoading, (isLoading) => {
    loadingArtists.value = isLoading
  })

  const filteredArtists = computed(() => {
    if (!searchQuery.value.trim()) return artists.value
    const query = searchQuery.value.toLowerCase()
    return artists.value.filter((a) => a.name.toLowerCase().includes(query))
  })

  const fetchArtists = async () => {
    await refresh()
  }

  const selectArtist = (artist: ArtistSummary) => {
    selectedArtist.value = selectedArtist.value?.id === artist.id ? null : artist
  }

  // Cleanup subscription on unmount
  onUnmounted(() => {
    subscribers.delete(handleCacheUpdate)
  })

  return {
    artists,
    searchQuery,
    selectedArtist,
    loadingArtists,
    fetchError,
    filteredArtists,
    fetchArtists,
    selectArtist,
    isRevalidating,
    clearCache,
  }
}
