using SpotifyAPI.Web;
using tracksByPopularity.Application.DTOs;
using tracksByPopularity.Application.Interfaces;

namespace tracksByPopularity.Infrastructure.Services;

/// <summary>
/// Service for caching user playlists.
/// </summary>
public class PlaylistCacheService : CacheServiceBase<IList<PlaylistInfo>>, IPlaylistCacheService
{
    private readonly IPlaylistService _playlistService;

    public PlaylistCacheService(ICacheRepository cache, IPlaylistService playlistService)
        : base(cache)
    {
        _playlistService = playlistService;
    }

    protected override string KeyPrefix => "playlists:";
    protected override TimeSpan CacheTtl => TimeSpan.FromMinutes(15);

    protected override async Task<IList<PlaylistInfo>> FetchAsync(SpotifyClient spotifyClient)
    {
        return await _playlistService.GetAllUserPlaylistsAsync(spotifyClient);
    }
}
