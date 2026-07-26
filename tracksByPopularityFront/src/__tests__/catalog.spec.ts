import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCatalogStore } from '@/stores/catalog'

const { getAllPlaylists, getLibraryArtists } = vi.hoisted(() => ({
  getAllPlaylists: vi.fn(),
  getLibraryArtists: vi.fn(),
}))

vi.mock('@/services/playlistApi', () => ({
  playlistApiService: { getAllPlaylists },
}))

vi.mock('@/services/trackApi', () => ({
  trackApiService: { getLibraryArtists },
}))

describe('catalog store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    getAllPlaylists.mockReset()
    getLibraryArtists.mockReset()
  })

  it('deduplicates concurrent playlist initialization and persists the result', async () => {
    getAllPlaylists.mockResolvedValue({
      success: true,
      data: [{ id: 'playlist-1', name: 'My playlist', totalTracks: 3 }],
    })
    const store = useCatalogStore()

    await Promise.all([store.initializePlaylists(), store.initializePlaylists()])

    expect(getAllPlaylists).toHaveBeenCalledTimes(1)
    expect(store.playlists).toHaveLength(1)
    expect(localStorage.getItem('playlists-cache')).toContain('playlist-1')
  })

  it('retains cached artists when a background refresh fails', async () => {
    localStorage.setItem(
      'artists-cache',
      JSON.stringify({ data: [{ id: 'artist-1', name: 'Artist', count: 2 }], timestamp: Date.now() }),
    )
    getLibraryArtists.mockResolvedValue({ success: false, error: 'Spotify unavailable' })
    const store = useCatalogStore()

    await store.initializeArtists()

    expect(store.artists).toHaveLength(1)
    await Promise.resolve()
    expect(store.artistsError).toBe('Spotify unavailable')
  })
})
