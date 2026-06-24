using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Interfaces;

/// <summary>
/// Abstraction for resolving and managing Spotify OAuth tokens and clients.
/// Implemented by <c>SpotifyAuthService</c> in Infrastructure.
/// </summary>
public interface ISpotifyAuthService
{
    /// <summary>
    /// Returns a client credentials Spotify client for public API access.
    /// </summary>
    SpotifyClient GetSpotifyClient();
    Task<SpotifyClient> GetSpotifyClientForUserAsync(string userId);
    Task StoreTokenAsync(AuthorizationCodeTokenResponse response, string userId);
    Task RemoveTokenAsync(string userId);
}