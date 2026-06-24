using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Interfaces;

/// <summary>
/// Orchestrates the common playlist organization flow for a single playlist:
/// snapshot, clear, and add the specified tracks.
/// </summary>
public interface IPlaylistOrganizationService
{
    /// <summary>
    /// Snapshots the playlist, clears it, and adds the provided tracks in batches.
    /// </summary>
    /// <param name="spotifyUserId">The Spotify user ID.</param>
    /// <param name="playlistId">The target playlist ID.</param>
    /// <param name="spotifyClient">The authenticated Spotify client.</param>
    /// <param name="operationType">Operation type stored in the snapshot (e.g., "popularity", "artist").</param>
    /// <param name="tracksToAdd">The tracks to add to the playlist.</param>
    /// <returns>True if the operation succeeded; otherwise false.</returns>
    Task<bool> OrganizePlaylistAsync(
        string spotifyUserId,
        string playlistId,
        SpotifyClient spotifyClient,
        string operationType,
        IList<SavedTrack> tracksToAdd
    );
}
