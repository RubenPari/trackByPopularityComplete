using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Services;

/// <summary>
/// Application service implementation for organizing artist tracks into playlists.
/// </summary>
public class ArtistTrackOrganizationService(
    ITrackCategorizationService categorizationService,
    IPlaylistHelper playlistHelper,
    IPlaylistOrganizationService organizationService,
    ILogger<ArtistTrackOrganizationService> logger)
    : IArtistTrackOrganizationService
{
    public async Task<bool> OrganizeArtistTracksAsync(
        string spotifyUserId,
        IList<SavedTrack> allTracks,
        string artistId,
        SpotifyClient spotifyClient
    )
    {
        logger.LogInformation("Organizing tracks for artist: {ArtistId}", artistId);

        var artistPlaylists = await playlistHelper.GetOrCreateArtistPlaylistsAsync(
            spotifyClient,
            artistId
        );

        var domainTracks = SpotifyTrackMapper.ToDomain(allTracks);
        var categorizedTracks = categorizationService.CategorizeArtistTracks(
            domainTracks,
            artistId
        );

        var results = new List<bool>();

        foreach (var (category, playlistId) in artistPlaylists)
        {
            if (!categorizedTracks.TryGetValue(category, out var tracks) || !tracks.Any())
            {
                logger.LogInformation("No tracks found for category {Category}", category);
                results.Add(true);
                continue;
            }

            var tracksToAdd = SpotifyTrackMapper.ToSavedTracks(allTracks, tracks).ToList();

            logger.LogInformation(
                "Adding {Count} tracks to playlist {PlaylistId} for category {Category}",
                tracksToAdd.Count,
                playlistId,
                category
            );

            var added = await organizationService.OrganizePlaylistAsync(
                spotifyUserId,
                playlistId,
                spotifyClient,
                "artist",
                tracksToAdd
            );

            results.Add(added);

            if (!added)
            {
                logger.LogWarning("Failed to organize playlist {PlaylistId} for category {Category}", playlistId, category);
            }
        }

        var allSucceeded = results.All(r => r);

        if (allSucceeded)
        {
            logger.LogInformation("Successfully organized all tracks for artist: {ArtistId}", artistId);
        }

        return allSucceeded;
    }
}
