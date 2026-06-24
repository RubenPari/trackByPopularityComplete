using SpotifyAPI.Web;
using tracksByPopularity.Application.Interfaces;

namespace tracksByPopularity.Infrastructure.Services;

/// <summary>
/// Base class for Spotify-data cache services using Redis.
/// Derived classes provide key prefix, TTL, and fetch logic.
/// </summary>
/// <typeparam name="T">The cached data type.</typeparam>
public abstract class CacheServiceBase<T> where T : class
{
    private readonly ICacheRepository _cache;

    protected CacheServiceBase(ICacheRepository cache)
    {
        _cache = cache;
    }

    /// <summary>
    /// Key prefix used to namespace cached entries in Redis.
    /// </summary>
    protected abstract string KeyPrefix { get; }

    /// <summary>
    /// Time-to-live for cached entries.
    /// </summary>
    protected abstract TimeSpan CacheTtl { get; }

    /// <summary>
    /// Fetches fresh data from the Spotify API when cache misses.
    /// </summary>
    protected abstract Task<T> FetchAsync(SpotifyClient spotifyClient);

    /// <summary>
    /// Gets cached data for the specified user, or fetches and caches it.
    /// </summary>
    public async Task<T> GetAsync(SpotifyClient spotifyClient, string spotifyUserId)
    {
        var key = $"{KeyPrefix}{spotifyUserId}";

        var cached = await _cache.GetAsync<T>(key);
        if (cached is not null)
        {
            return cached;
        }

        var data = await FetchAsync(spotifyClient);
        await _cache.SetAsync(key, data, CacheTtl);
        return data;
    }

    /// <summary>
    /// Invalidates the cached data for the specified user.
    /// </summary>
    public async Task InvalidateAsync(string spotifyUserId)
    {
        var key = $"{KeyPrefix}{spotifyUserId}";
        await _cache.RemoveAsync(key);
    }
}
