using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Services;

/// <summary>
/// Application service implementation for organizing tracks into playlists by popularity range.
/// </summary>
public class TrackOrganizationService(
    ITrackCategorizationService categorizationService,
    IPlaylistHelper playlistHelper,
    IPlaylistOrganizationService organizationService,
    ILogger<TrackOrganizationService> logger)
    : ITrackOrganizationService
{
    public async Task<bool> OrganizeTracksByPopularityAsync(
        string spotifyUserId,
        IList<SavedTrack> allTracks,
        PopularityRange popularityRange,
        SpotifyClient spotifyClient
    )
    {
        var playlistId = await playlistHelper.GetOrCreatePopularityPlaylistAsync(spotifyClient, popularityRange);

        logger.LogInformation(
            "Organizing tracks by popularity range {Min}-{Max} for playlist {PlaylistId}",
            popularityRange.Min,
            popularityRange.Max,
            playlistId
        );

        var domainTracks = SpotifyTrackMapper.ToDomain(allTracks);
        var categorizedTracks = categorizationService.CategorizeByPopularity(
            domainTracks,
            popularityRange
        ).ToList();

        if (categorizedTracks.Count == 0)
        {
            logger.LogInformation("No tracks found in popularity range {Min}-{Max}", popularityRange.Min, popularityRange.Max);
        }

        var tracksToAdd = SpotifyTrackMapper.ToSavedTracks(allTracks, categorizedTracks).ToList();

        return await organizationService.OrganizePlaylistAsync(
            spotifyUserId,
            playlistId,
            spotifyClient,
            "popularity",
            tracksToAdd
        );
    }
}

