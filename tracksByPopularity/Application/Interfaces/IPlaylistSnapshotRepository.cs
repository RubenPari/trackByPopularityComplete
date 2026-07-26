using Snapshot = tracksByPopularity.Domain.Entities.PlaylistSnapshot;

namespace tracksByPopularity.Application.Interfaces;

public interface IPlaylistSnapshotRepository
{
    Task AddAsync(Snapshot snapshot);
    Task<IList<Snapshot>> GetByUserAsync(string spotifyUserId);
    Task<Snapshot?> GetByIdAsync(Guid snapshotId, string spotifyUserId, bool includeTracks = false);
    Task DeleteAsync(Snapshot snapshot);
    Task<int> DeleteOlderThanAsync(DateTime cutoffDate);
}
