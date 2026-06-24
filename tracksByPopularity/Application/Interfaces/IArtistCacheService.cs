using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Interfaces;

/// <summary>
/// Cache service for followed artists.
/// </summary>
public interface IArtistCacheService : ICacheService<ISet<string>>
{
}
