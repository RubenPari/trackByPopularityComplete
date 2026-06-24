using tracksByPopularity.Application.DTOs;

namespace tracksByPopularity.Application.Interfaces;

/// <summary>
/// Cache service for user playlists.
/// </summary>
public interface IPlaylistCacheService : ICacheService<IList<PlaylistInfo>>
{
}
