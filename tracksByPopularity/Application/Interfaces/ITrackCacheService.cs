using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Interfaces;

/// <summary>
/// Cache service for user tracks.
/// </summary>
public interface ITrackCacheService : ICacheService<IList<SavedTrack>>
{
}
