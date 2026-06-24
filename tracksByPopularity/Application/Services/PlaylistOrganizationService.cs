using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Services;

/// <summary>
/// Orchestrates the common playlist organization flow: snapshot, clear, and add tracks.
/// </summary>
public class PlaylistOrganizationService(
    ITrackService trackService,
    IPlaylistService playlistService,
    IPlaylistBackupService backupService,
    ILogger<PlaylistOrganizationService> logger)
    : IPlaylistOrganizationService
{
    public async Task<bool> OrganizePlaylistAsync(
        string spotifyUserId,
        string playlistId,
        SpotifyClient spotifyClient,
        string operationType,
        IList<SavedTrack> tracksToAdd
    )
    {
        logger.LogInformation(
            "Organizing playlist {PlaylistId} for operation {OperationType} with {Count} tracks",
            playlistId,
            operationType,
            tracksToAdd.Count
        );

        await backupService.CreateSnapshotAsync(spotifyUserId, playlistId, spotifyClient, operationType);
        await playlistService.RemoveAllTracksAsync(playlistId, spotifyClient);

        if (tracksToAdd.Count == 0)
        {
            logger.LogInformation("No tracks to add to playlist {PlaylistId}", playlistId);
            return true;
        }

        var result = await trackService.AddTracksToPlaylistAsync(spotifyClient, playlistId, tracksToAdd);

        if (result)
        {
            logger.LogInformation(
                "Successfully added {Count} tracks to playlist {PlaylistId}",
                tracksToAdd.Count,
                playlistId
            );
        }
        else
        {
            logger.LogWarning("Failed to add tracks to playlist {PlaylistId}", playlistId);
        }

        return result;
    }
}
