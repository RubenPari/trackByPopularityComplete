import { httpClient } from './httpClient'
import type { ApiResponse, PlaylistSnapshot, TrackResponse } from '@/types/api'
import { API_ENDPOINTS } from '@/utils/constants'

export class BackupApiService {
  async getSnapshots(): Promise<ApiResponse<PlaylistSnapshot[]>> {
    return httpClient.get<PlaylistSnapshot[]>(API_ENDPOINTS.BACKUP.LIST)
  }

  async restoreSnapshot(snapshotId: string): Promise<ApiResponse<TrackResponse>> {
    return httpClient.post<TrackResponse>(API_ENDPOINTS.BACKUP.RESTORE(snapshotId))
  }

  async deleteSnapshot(snapshotId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.BACKUP.DELETE(snapshotId))
  }
}

export const backupApiService = new BackupApiService()
