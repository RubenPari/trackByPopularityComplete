import { computed, shallowRef, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { playlistApiService } from '@/services/playlistApi'
import { trackApiService } from '@/services/trackApi'
import { clearStorage, loadFromStorage, saveToStorage } from '@/composables/useLocalStorage'
import type { ArtistSummary, PlaylistInfo } from '@/types/api'

const CACHE_STALE_TIME = 5 * 60 * 1000
const PLAYLISTS_CACHE_KEY = 'playlists-cache'
const ARTISTS_CACHE_KEY = 'artists-cache'

interface ResourceState<T> {
  value: Ref<T[]>
  loading: Ref<boolean>
  refreshing: Ref<boolean>
  error: Ref<string | null>
  updatedAt: Ref<number | null>
  pending: Promise<void> | null
}

function createResource<T>(): ResourceState<T> {
  return {
    value: shallowRef<T[]>([]),
    loading: ref(false),
    refreshing: ref(false),
    error: ref<string | null>(null),
    updatedAt: ref<number | null>(null),
    pending: null,
  }
}

export const useCatalogStore = defineStore('catalog', () => {
  const playlists = createResource<PlaylistInfo>()
  const artists = createResource<ArtistSummary>()

  const isFresh = (updatedAt: number | null): boolean =>
    updatedAt !== null && Date.now() - updatedAt < CACHE_STALE_TIME

  const loadCached = <T>(resource: ResourceState<T>, key: string): boolean => {
    const cached = loadFromStorage<T[]>(key, CACHE_STALE_TIME)
    if (!cached) return false

    resource.value.value = cached
    resource.updatedAt.value = Date.now()
    return true
  }

  const fetchResource = async <T>(
    resource: ResourceState<T>,
    key: string,
    fetcher: () => Promise<{ success: boolean; data?: T[]; error?: string }>,
    force = false,
  ): Promise<void> => {
    if (resource.pending) return resource.pending
    if (!force && resource.value.value.length > 0 && isFresh(resource.updatedAt.value)) return

    const isInitialLoad = resource.value.value.length === 0
    resource.loading.value = isInitialLoad
    resource.refreshing.value = !isInitialLoad
    resource.error.value = null

    resource.pending = (async () => {
      try {
        const response = await fetcher()
        if (!response.success) throw new Error(response.error || 'Request failed')

        resource.value.value = response.data ?? []
        resource.updatedAt.value = Date.now()
        saveToStorage(key, resource.value.value)
      } catch (error) {
        resource.error.value = error instanceof Error ? error.message : 'Request failed'
      } finally {
        resource.loading.value = false
        resource.refreshing.value = false
        resource.pending = null
      }
    })()

    return resource.pending
  }

  const initializePlaylists = async (): Promise<void> => {
    if (loadCached(playlists, PLAYLISTS_CACHE_KEY)) {
      void fetchResource(playlists, PLAYLISTS_CACHE_KEY, () => playlistApiService.getAllPlaylists(), true)
      return
    }
    await fetchResource(playlists, PLAYLISTS_CACHE_KEY, () => playlistApiService.getAllPlaylists())
  }

  const refreshPlaylists = (): Promise<void> =>
    fetchResource(playlists, PLAYLISTS_CACHE_KEY, () => playlistApiService.getAllPlaylists(), true)

  const initializeArtists = async (): Promise<void> => {
    if (loadCached(artists, ARTISTS_CACHE_KEY)) {
      void fetchResource(artists, ARTISTS_CACHE_KEY, () => trackApiService.getLibraryArtists(), true)
      return
    }
    await fetchResource(artists, ARTISTS_CACHE_KEY, () => trackApiService.getLibraryArtists())
  }

  const refreshArtists = (): Promise<void> =>
    fetchResource(artists, ARTISTS_CACHE_KEY, () => trackApiService.getLibraryArtists(), true)

  const clearPlaylists = (): void => {
    playlists.value.value = []
    playlists.updatedAt.value = null
    clearStorage(PLAYLISTS_CACHE_KEY)
  }

  const clearArtists = (): void => {
    artists.value.value = []
    artists.updatedAt.value = null
    clearStorage(ARTISTS_CACHE_KEY)
  }

  return {
    playlists: playlists.value,
    playlistsLoading: playlists.loading,
    playlistsRefreshing: playlists.refreshing,
    playlistsError: playlists.error,
    artists: artists.value,
    artistsLoading: artists.loading,
    artistsRefreshing: artists.refreshing,
    artistsError: artists.error,
    initializePlaylists,
    refreshPlaylists,
    initializeArtists,
    refreshArtists,
    clearPlaylists,
    clearArtists,
    hasPlaylists: computed(() => playlists.value.value.length > 0),
    hasArtists: computed(() => artists.value.value.length > 0),
  }
})
