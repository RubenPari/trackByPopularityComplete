import { ref } from 'vue'
import type { PlaylistSnapshot } from '@/types/api'
import { backupApiService } from '@/services/backupApi'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useBackup')

export function useBackup() {
  const snapshots = ref<PlaylistSnapshot[]>([])
  const loadingSnapshots = ref(false)
  const restoringId = ref<string | null>(null)
  const deletingId = ref<string | null>(null)

  const fetchSnapshots = async () => {
    loadingSnapshots.value = true
    try {
      const response = await backupApiService.getSnapshots()
      if (response.success && response.data) {
        snapshots.value = response.data
      }
    } catch (error) {
      logger.error('Failed to fetch snapshots', error)
    } finally {
      loadingSnapshots.value = false
    }
  }

  const restoreSnapshot = async (snapshotId: string): Promise<boolean> => {
    restoringId.value = snapshotId
    try {
      const response = await backupApiService.restoreSnapshot(snapshotId)
      if (response.success) {
        await fetchSnapshots()
        return true
      }
      return false
    } catch (error) {
      logger.error(`Failed to restore snapshot ${snapshotId}`, error)
      return false
    } finally {
      restoringId.value = null
    }
  }

  const deleteSnapshot = async (snapshotId: string): Promise<boolean> => {
    deletingId.value = snapshotId
    try {
      const response = await backupApiService.deleteSnapshot(snapshotId)
      if (response.success) {
        await fetchSnapshots()
        return true
      }
      return false
    } catch (error) {
      logger.error(`Failed to delete snapshot ${snapshotId}`, error)
      return false
    } finally {
      deletingId.value = null
    }
  }

  return {
    snapshots,
    loadingSnapshots,
    restoringId,
    deletingId,
    fetchSnapshots,
    restoreSnapshot,
    deleteSnapshot,
  }
}
