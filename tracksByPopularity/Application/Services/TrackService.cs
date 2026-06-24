using SpotifyAPI.Web;
using tracksByPopularity.Application.Helpers;

namespace tracksByPopularity.Application.Services;

/// <summary>
/// Service implementation for track-related operations.
/// Handles retrieval of user tracks and adding tracks to playlists.
/// </summary>
public class TrackService : ITrackService
{
    private readonly ILogger<TrackService> _logger;

    public TrackService(ILogger<TrackService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all tracks from the user's Spotify library.
    /// Automatically handles pagination to fetch all tracks across multiple pages.
    /// </summary>
    public async Task<IList<SavedTrack>> GetAllUserTracksWithClientAsync(
        SpotifyClient spotifyClient
    )
    {
        var firstPageTracks = await spotifyClient.Library.GetTracks();
        return await spotifyClient.PaginateAll(firstPageTracks);
    }

    /// <summary>
    /// Adds a collection of tracks to a specified Spotify playlist in batches of 100.
    /// </summary>
    public async Task<bool> AddTracksToPlaylistAsync(
        SpotifyClient spotifyClient,
        string playlistId,
        IList<SavedTrack> tracks
    )
    {
        return await PlaylistTrackBatchHelper.AddSavedTracksInBatchesAsync(
            spotifyClient,
            playlistId,
            tracks,
            _logger
        );
    }
}
