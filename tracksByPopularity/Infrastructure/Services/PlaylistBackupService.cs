using tracksByPopularity.Application.DTOs;
using tracksByPopularity.Application.Interfaces;
using tracksByPopularity.Domain.Entities;

namespace tracksByPopularity.Infrastructure.Services;

public class PlaylistBackupService : IPlaylistBackupService
{
    private readonly IPlaylistSnapshotRepository _snapshotRepository;
    private readonly ILogger<PlaylistBackupService> _logger;

    public PlaylistBackupService(IPlaylistSnapshotRepository snapshotRepository, ILogger<PlaylistBackupService> logger)
    {
        _snapshotRepository = snapshotRepository;
        _logger = logger;
    }

    public async Task<string> CreateSnapshotAsync(
        string spotifyUserId,
        string playlistId,
        ISpotifyPlaylistGateway playlistGateway,
        string operationType)
    {
        _logger.LogInformation("Creating snapshot for playlist {PlaylistId} for user {SpotifyUserId}", playlistId, spotifyUserId);

        var contents = await playlistGateway.GetContentsAsync(playlistId);
        var trackUris = contents.TrackUris
            .Select((trackUri, index) => new SnapshotTrack
            {
                TrackUri = trackUri,
                OrderIndex = index
            })
            .ToList();

        var snapshot = new Domain.Entities.PlaylistSnapshot
        {
            Id = Guid.NewGuid(),
            SpotifyUserId = spotifyUserId,
            PlaylistId = playlistId,
            PlaylistName = contents.Name,
            OperationType = operationType,
            CreatedAt = DateTime.UtcNow,
            TrackCount = trackUris.Count,
            Tracks = trackUris
        };

        await _snapshotRepository.AddAsync(snapshot);

        _logger.LogInformation("Snapshot {SnapshotId} created for playlist {PlaylistId} with {Count} tracks",
            snapshot.Id, playlistId, trackUris.Count);

        return snapshot.Id.ToString();
    }

    public async Task<IList<Application.DTOs.PlaylistSnapshot>> GetSnapshotsAsync(string spotifyUserId)
    {
        var snapshots = await _snapshotRepository.GetByUserAsync(spotifyUserId);
        return snapshots.Select(snapshot => new Application.DTOs.PlaylistSnapshot
            {
                Id = snapshot.Id.ToString(),
                PlaylistId = snapshot.PlaylistId,
                PlaylistName = snapshot.PlaylistName,
                OperationType = snapshot.OperationType,
                CreatedAt = snapshot.CreatedAt,
                TrackCount = snapshot.TrackCount,
                TrackUris = snapshot.Tracks.OrderBy(track => track.OrderIndex).Select(track => track.TrackUri).ToList()
            })
            .ToList();
    }

    public async Task<bool> RestoreSnapshotAsync(
        string snapshotId,
        string spotifyUserId,
        ISpotifyPlaylistGateway playlistGateway)
    {
        if (!Guid.TryParse(snapshotId, out var snapshotGuid))
        {
            _logger.LogWarning("Invalid snapshot ID format: {SnapshotId}", snapshotId);
            return false;
        }

        var snapshot = await _snapshotRepository.GetByIdAsync(snapshotGuid, spotifyUserId, includeTracks: true);

        if (snapshot == null)
        {
            _logger.LogWarning("Snapshot {SnapshotId} not found for user {SpotifyUserId}", snapshotId, spotifyUserId);
            return false;
        }

        _logger.LogInformation("Restoring snapshot {SnapshotId} for playlist {PlaylistId}", snapshotId, snapshot.PlaylistId);

        await playlistGateway.ReplaceItemsAsync(snapshot.PlaylistId, []);

        var trackUris = snapshot.Tracks.OrderBy(t => t.OrderIndex).Select(t => t.TrackUri).ToList();
        var restored = await playlistGateway.AddItemsAsync(snapshot.PlaylistId, trackUris);

        if (!restored)
        {
            _logger.LogWarning("Failed to restore tracks to playlist {PlaylistId}", snapshot.PlaylistId);
            return false;
        }

        _logger.LogInformation("Restored {Count} tracks to playlist {PlaylistId}", snapshot.TrackCount, snapshot.PlaylistId);
        return true;
    }

    public async Task<bool> DeleteSnapshotAsync(string snapshotId, string spotifyUserId)
    {
        if (!Guid.TryParse(snapshotId, out var snapshotGuid))
        {
            _logger.LogWarning("Invalid snapshot ID format: {SnapshotId}", snapshotId);
            return false;
        }

        var snapshot = await _snapshotRepository.GetByIdAsync(snapshotGuid, spotifyUserId);

        if (snapshot == null)
        {
            _logger.LogWarning("Snapshot {SnapshotId} not found for user {SpotifyUserId}", snapshotId, spotifyUserId);
            return false;
        }

        await _snapshotRepository.DeleteAsync(snapshot);

        _logger.LogInformation("Deleted snapshot {SnapshotId}", snapshotId);
        return true;
    }

    public async Task<int> DeleteOldSnapshotsAsync(int daysOld)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysOld);

        var deletedCount = await _snapshotRepository.DeleteOlderThanAsync(cutoffDate);

        _logger.LogInformation("Deleted {Count} snapshots older than {Days} days", deletedCount, daysOld);
        return deletedCount;
    }
}
