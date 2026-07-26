import { ref, computed } from 'vue'
import type { ArtistSummary } from '@/types/api'
import { useCachedArtists } from './useCachedArtists'

export function useArtistSelection() {
  const {
    artists,
    loading: artistsLoading,
    isRevalidating,
    initialize,
    clearCache,
  } = useCachedArtists()

  const searchQuery = ref('')
  const selectedArtist = ref<ArtistSummary | null>(null)

  const filteredArtists = computed(() => {
    if (!searchQuery.value.trim()) return artists.value
    const query = searchQuery.value.toLowerCase()
    return artists.value.filter((a) => a.name.toLowerCase().includes(query))
  })

  const fetchArtists = initialize

  const selectArtist = (artist: ArtistSummary) => {
    selectedArtist.value = selectedArtist.value?.id === artist.id ? null : artist
  }

  return {
    artists,
    searchQuery,
    selectedArtist,
    loadingArtists: artistsLoading,
    filteredArtists,
    fetchArtists,
    selectArtist,
    isRevalidating,
    clearCache,
  }
}
