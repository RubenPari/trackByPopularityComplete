using SpotifyAPI.Web;
using tracksByPopularity.Application.DTOs;
using tracksByPopularity.Application.Interfaces;

namespace tracksByPopularity.Infrastructure.Services;

public class SpotifyPlaylistGateway(SpotifyClient spotifyClient) : ISpotifyPlaylistGateway
{
    private const int BatchSize = 100;

    public async Task<PlaylistContents> GetContentsAsync(string playlistId)
    {
        var firstPage = await spotifyClient.Playlists.GetItems(playlistId);
        var items = await spotifyClient.PaginateAll(firstPage);
        var playlist = await spotifyClient.Playlists.Get(playlistId);
        var trackUris = items
            .Where(item => item.Track is FullTrack)
            .Select(item => ((FullTrack)item.Track).Uri)
            .ToList();

        return new PlaylistContents(playlist?.Name ?? playlistId, trackUris);
    }

    public async Task ReplaceItemsAsync(string playlistId, IList<string> trackUris)
    {
        await spotifyClient.Playlists.ReplaceItems(playlistId, new PlaylistReplaceItemsRequest(trackUris.ToList()));
    }

    public async Task<bool> AddItemsAsync(string playlistId, IList<string> trackUris)
    {
        foreach (var batch in trackUris.Chunk(BatchSize))
        {
            var result = await spotifyClient.Playlists.AddItems(
                playlistId,
                new PlaylistAddItemsRequest(batch.ToList()));
            if (string.IsNullOrWhiteSpace(result.SnapshotId)) return false;
        }

        return true;
    }
}

public class SpotifyPlaylistGatewayFactory : ISpotifyPlaylistGatewayFactory
{
    public ISpotifyPlaylistGateway Create(SpotifyClient spotifyClient) => new SpotifyPlaylistGateway(spotifyClient);
}
