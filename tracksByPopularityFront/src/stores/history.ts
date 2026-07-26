import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { backupApiService } from '@/services/backupApi'
import { createLogger } from '@/utils/logger'
import type { PlaylistSnapshot } from '@/types/api'

const logger = createLogger('HistoryStore')

export const useHistoryStore = defineStore('history', () => {
  const snapshots = ref<PlaylistSnapshot[]>([])
  const loading = ref(false)
  const refreshing = ref(false)
  const error = ref<string | null>(null)
  const restoringId = ref<string | null>(null)
  const deletingId = ref<string | null>(null)
  const initialized = ref(false)

  const sortedSnapshots = computed(() =>
    [...snapshots.value].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    ),
  )

  const latestSnapshot = computed(() => sortedSnapshots.value[0] ?? null)

  const fetchSnapshots = async (force = false): Promise<void> => {
    if (loading.value || refreshing.value) return
    if (initialized.value && !force) return

    const hasData = snapshots.value.length > 0
    loading.value = !hasData
    refreshing.value = hasData
    error.value = null

    try {
      const response = await backupApiService.getSnapshots()
      if (!response.success) {
        throw new Error(response.error || 'Unable to load history')
      }
      snapshots.value = response.data ?? []
      initialized.value = true
    } catch (fetchError) {
      error.value =
        fetchError instanceof Error ? fetchError.message : 'Unable to load history'
      logger.error('Failed to fetch snapshots', fetchError)
    } finally {
      loading.value = false
      refreshing.value = false
    }
  }

  const restoreSnapshot = async (snapshotId: string): Promise<boolean> => {
    restoringId.value = snapshotId
    error.value = null
    try {
      const response = await backupApiService.restoreSnapshot(snapshotId)
      if (!response.success) {
        throw new Error(response.error || 'Unable to restore backup')
      }
      await fetchSnapshots(true)
      return true
    } catch (restoreError) {
      error.value =
        restoreError instanceof Error ? restoreError.message : 'Unable to restore backup'
      logger.error(`Failed to restore snapshot ${snapshotId}`, restoreError)
      return false
    } finally {
      restoringId.value = null
    }
  }

  const deleteSnapshot = async (snapshotId: string): Promise<boolean> => {
    deletingId.value = snapshotId
    error.value = null
    try {
      const response = await backupApiService.deleteSnapshot(snapshotId)
      if (!response.success) {
        throw new Error(response.error || 'Unable to delete backup')
      }
      snapshots.value = snapshots.value.filter((snapshot) => snapshot.id !== snapshotId)
      return true
    } catch (deleteError) {
      error.value =
        deleteError instanceof Error ? deleteError.message : 'Unable to delete backup'
      logger.error(`Failed to delete snapshot ${snapshotId}`, deleteError)
      return false
    } finally {
      deletingId.value = null
    }
  }

  return {
    snapshots,
    sortedSnapshots,
    latestSnapshot,
    loading,
    refreshing,
    error,
    restoringId,
    deletingId,
    fetchSnapshots,
    restoreSnapshot,
    deleteSnapshot,
  }
})
