using SpotifyAPI.Web;
using tracksByPopularity.Application.Interfaces;

namespace tracksByPopularity.Infrastructure.Services;

/// <summary>
/// Service for caching followed artists.
/// </summary>
public class ArtistCacheService : CacheServiceBase<ISet<string>>, IArtistCacheService
{
    public ArtistCacheService(ICacheRepository cache)
        : base(cache)
    {
    }

    protected override string KeyPrefix => "artists:";
    protected override TimeSpan CacheTtl => TimeSpan.FromMinutes(30);

    protected override async Task<ISet<string>> FetchAsync(SpotifyClient spotifyClient)
    {
        var followedIds = new HashSet<string>();
        string? after = null;

        while (true)
        {
            var followedRequest = new FollowOfCurrentUserRequest { Limit = 50 };
            if (after != null) followedRequest.After = after;

            var response = await spotifyClient.Follow.OfCurrentUser(followedRequest);
            var page = response.Artists;

            foreach (var artist in page.Items ?? new List<FullArtist>())
            {
                if (!string.IsNullOrEmpty(artist.Id))
                {
                    followedIds.Add(artist.Id);
                }
            }

            if (page.Cursors?.After == null) break;
            after = page.Cursors.After;
        }

        return followedIds;
    }
}
