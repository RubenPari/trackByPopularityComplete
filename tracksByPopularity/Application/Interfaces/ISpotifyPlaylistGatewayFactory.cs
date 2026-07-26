using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Interfaces;

public interface ISpotifyPlaylistGatewayFactory
{
    ISpotifyPlaylistGateway Create(SpotifyClient spotifyClient);
}
