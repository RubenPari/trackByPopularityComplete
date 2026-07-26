import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHistoryStore } from '@/stores/history'

const { getSnapshots, restoreSnapshot, deleteSnapshot } = vi.hoisted(() => ({
  getSnapshots: vi.fn(),
  restoreSnapshot: vi.fn(),
  deleteSnapshot: vi.fn(),
}))

vi.mock('@/services/backupApi', () => ({
  backupApiService: {
    getSnapshots,
    restoreSnapshot,
    deleteSnapshot,
  },
}))

describe('history store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getSnapshots.mockReset()
    restoreSnapshot.mockReset()
    deleteSnapshot.mockReset()
  })

  it('sorts snapshots newest first and exposes the latest activity', async () => {
    getSnapshots.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'old',
          playlistId: 'one',
          playlistName: 'Older playlist',
          operationType: 'artist',
          createdAt: '2026-01-01T10:00:00Z',
          trackCount: 4,
        },
        {
          id: 'new',
          playlistId: 'two',
          playlistName: 'Newer playlist',
          operationType: 'popularity',
          createdAt: '2026-02-01T10:00:00Z',
          trackCount: 8,
        },
      ],
    })

    const store = useHistoryStore()
    await store.fetchSnapshots()

    expect(store.sortedSnapshots.map((snapshot) => snapshot.id)).toEqual(['new', 'old'])
    expect(store.latestSnapshot?.id).toBe('new')
  })

  it('removes a deleted snapshot from shared state', async () => {
    getSnapshots.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'snapshot-1',
          playlistId: 'one',
          playlistName: 'Playlist',
          operationType: 'popularity',
          createdAt: '2026-02-01T10:00:00Z',
          trackCount: 8,
        },
      ],
    })
    deleteSnapshot.mockResolvedValue({ success: true, data: undefined })

    const store = useHistoryStore()
    await store.fetchSnapshots()
    const result = await store.deleteSnapshot('snapshot-1')

    expect(result).toBe(true)
    expect(store.snapshots).toEqual([])
  })
})
