import { storeToRefs } from 'pinia'
import { useHistoryStore } from '@/stores/history'

export function useBackup() {
  const store = useHistoryStore()
  const { snapshots, loading, restoringId, deletingId, error } = storeToRefs(store)

  return {
    snapshots,
    loadingSnapshots: loading,
    restoringId,
    deletingId,
    error,
    fetchSnapshots: store.fetchSnapshots,
    restoreSnapshot: store.restoreSnapshot,
    deleteSnapshot: store.deleteSnapshot,
  }
}
