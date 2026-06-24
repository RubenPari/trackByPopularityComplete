using SpotifyAPI.Web;
using tracksByPopularity.Application.Interfaces;

namespace tracksByPopularity.Infrastructure.Services;

/// <summary>
/// Service for caching user tracks.
/// </summary>
public class TrackCacheService : CacheServiceBase<IList<SavedTrack>>, ITrackCacheService
{
    private readonly ITrackService _trackService;

    public TrackCacheService(ICacheRepository cache, ITrackService trackService)
        : base(cache)
    {
        _trackService = trackService;
    }

    protected override string KeyPrefix => "tracks:";
    protected override TimeSpan CacheTtl => TimeSpan.FromMinutes(10);

    protected override async Task<IList<SavedTrack>> FetchAsync(SpotifyClient spotifyClient)
    {
        return await _trackService.GetAllUserTracksWithClientAsync(spotifyClient);
    }
}
