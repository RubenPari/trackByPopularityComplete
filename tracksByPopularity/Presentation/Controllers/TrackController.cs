using Microsoft.AspNetCore.Mvc;
using SpotifyAPI.Web;
using tracksByPopularity.Application.DTOs;
using tracksByPopularity.Application.Interfaces;
using tracksByPopularity.Presentation.Filters;

namespace tracksByPopularity.Presentation.Controllers;

/// <summary>
/// API controller for track-related operations.
/// Uses ISP: Injects only the cache services it needs (ITrackCacheService, IArtistCacheService).
/// </summary>
[ApiController]
[Route("api/track")]
public class TrackController(
    ITrackCacheService trackCacheService,
    IArtistCacheService artistCacheService,
    IPlaylistCacheService playlistCacheService,
    IArtistLibraryService artistLibraryService,
    ITrackOrganizationService trackOrganizationService,
    IArtistTrackOrganizationService artistTrackOrganizationService,
    ILogger<TrackController> logger)
    : ControllerBase
{
    /// <summary>
    /// Adds tracks to the designated playlist based on the specified popularity range.
    /// Available ranges: "less" (0-20), "less-medium" (21-40), "medium" (41-60), "more-medium" (61-80), "more" (81-100).
    /// </summary>
    [HttpPost("popularity/{range}")]
    [SpotifyAuth]
    public async Task<ActionResult<ApiResponse>> AddTracksByPopularity(string range)
    {
        var popularityRange = range.ToLowerInvariant() switch
        {
            "less" => PopularityRange.Less,
            "less-medium" => PopularityRange.LessMedium,
            "medium" => PopularityRange.Medium,
            "more-medium" => PopularityRange.MoreMedium,
            "more" => PopularityRange.More,
            _ => null
        };

        if (popularityRange == null)
        {
            logger.LogWarning("Invalid popularity range requested: {Range}", range);
            return BadRequest(ApiResponse.Fail($"Invalid popularity range: {range}. Valid values are: less, less-medium, medium, more-medium, more."));
        }

        var spotifyClient = HttpContext.GetSpotifyClient();
        var spotifyUserId = HttpContext.GetSpotifyUserId();
        var allTracks = await trackCacheService.GetAsync(spotifyClient, spotifyUserId);

        var added = await trackOrganizationService.OrganizeTracksByPopularityAsync(
            spotifyUserId,
            allTracks,
            popularityRange,
            spotifyClient
        );

        if (added)
        {
            await playlistCacheService.InvalidateAsync(spotifyUserId);
            return Ok(ApiResponse.Ok("Tracks added to playlist"));
        }

        logger.LogWarning("Failed to add tracks to playlist for popularity range: {Range}", range);
        return BadRequest(ApiResponse.Fail("Failed to add tracks to playlist"));
    }

    /// <summary>
    /// Returns a list of unique artists from the user's saved tracks, sorted by track count.
    /// Results are cached for improved performance.
    /// </summary>
    [HttpGet("artists")]
    [SpotifyAuth]
    public async Task<ActionResult<ApiResponse<IEnumerable<ArtistSummary>>>> GetLibraryArtists()
    {
        var spotifyClient = HttpContext.GetSpotifyClient();
        var spotifyUserId = HttpContext.GetSpotifyUserId();

        // Use cached followed artists (ISP: only inject what we need)
        var followedIds = await artistCacheService.GetAsync(spotifyClient, spotifyUserId);

        // Use cached tracks (ISP: only inject what we need)
        var allTracks = await trackCacheService.GetAsync(spotifyClient, spotifyUserId);

        var artists = await artistLibraryService.GetFollowedLibraryArtistsAsync(allTracks, followedIds);

        // Set cache headers for client-side caching
        Response.Headers["Cache-Control"] = "public, max-age=60";
        Response.Headers["ETag"] = $"\"artists-{followedIds.Count}-{allTracks.Count}\"";

        return Ok(ApiResponse<IEnumerable<ArtistSummary>>.Ok(artists));
    }

    /// <summary>
    /// Organizes tracks from a specific artist into three playlists based on popularity.
    /// </summary>
    [HttpPost("artist")]
    [SpotifyAuth]
    public async Task<ActionResult<ApiResponse>> Artist([FromQuery] AddTracksByArtistRequest request)
    {
        var spotifyClient = HttpContext.GetSpotifyClient();
        var spotifyUserId = HttpContext.GetSpotifyUserId();
        var allTracks = await trackCacheService.GetAsync(spotifyClient, spotifyUserId);

        var added = await artistTrackOrganizationService.OrganizeArtistTracksAsync(
            spotifyUserId,
            allTracks,
            request.ArtistId,
            spotifyClient
        );

        if (added)
        {
            await playlistCacheService.InvalidateAsync(spotifyUserId);
            return Ok(ApiResponse.Ok("Tracks added to playlist"));
        }

        logger.LogWarning("Failed to organize tracks for artist: {ArtistId}", request.ArtistId);
        return BadRequest(ApiResponse.Fail("Failed to add tracks to playlist"));
    }
}
