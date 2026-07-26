using tracksByPopularity.Application.DTOs;

namespace tracksByPopularity.Application.Interfaces;

public interface ISpotifyPlaylistGateway
{
    Task<PlaylistContents> GetContentsAsync(string playlistId);
    Task ReplaceItemsAsync(string playlistId, IList<string> trackUris);
    Task<bool> AddItemsAsync(string playlistId, IList<string> trackUris);
}
