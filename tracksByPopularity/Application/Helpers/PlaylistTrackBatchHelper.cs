using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Helpers;

/// <summary>
/// Helper for adding Spotify tracks to playlists in batches of 100,
/// which is the Spotify API limit per request.
/// </summary>
public static class PlaylistTrackBatchHelper
{
    private const int SpotifyBatchSize = 100;

    /// <summary>
    /// Adds the specified tracks to a playlist in batches of 100.
    /// </summary>
    /// <returns>True if all batches were added successfully; otherwise false.</returns>
    public static async Task<bool> AddSavedTracksInBatchesAsync(
        SpotifyClient spotifyClient,
        string playlistId,
        IEnumerable<SavedTrack> tracks,
        ILogger logger
    )
    {
        var trackUris = tracks.Select(t => t.Track.Uri).ToList();
        return await AddTrackUrisInBatchesAsync(spotifyClient, playlistId, trackUris, logger);
    }

    /// <summary>
    /// Adds the specified track URIs to a playlist in batches of 100.
    /// </summary>
    /// <returns>True if all batches were added successfully; otherwise false.</returns>
    public static async Task<bool> AddTrackUrisInBatchesAsync(
        SpotifyClient spotifyClient,
        string playlistId,
        IList<string> trackUris,
        ILogger logger
    )
    {
        for (var i = 0; i < trackUris.Count; i += SpotifyBatchSize)
        {
            var batch = trackUris.Skip(i).Take(SpotifyBatchSize).ToList();

            logger.LogInformation(
                "Adding batch of {BatchSize} tracks to playlist {PlaylistId} (offset {Offset})",
                batch.Count,
                playlistId,
                i
            );

            var added = await spotifyClient.Playlists.AddItems(
                playlistId,
                new PlaylistAddItemsRequest(batch)
            );

            if (string.IsNullOrWhiteSpace(added.SnapshotId))
            {
                logger.LogWarning(
                    "Failed to add batch to playlist {PlaylistId} at offset {Offset}",
                    playlistId,
                    i
                );
                return false;
            }
        }

        return true;
    }
}
