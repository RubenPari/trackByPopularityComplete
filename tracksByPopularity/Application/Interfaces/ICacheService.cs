using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Interfaces;

/// <summary>
/// Generic cache service for fetching and invalidating Spotify data.
/// </summary>
/// <typeparam name="T">The cached data type.</typeparam>
public interface ICacheService<T> where T : class
{
    /// <summary>
    /// Gets cached data for the specified user, or fetches and caches it.
    /// </summary>
    Task<T> GetAsync(SpotifyClient spotifyClient, string spotifyUserId);

    /// <summary>
    /// Invalidates the cached data for the specified user.
    /// </summary>
    Task InvalidateAsync(string spotifyUserId);
}
