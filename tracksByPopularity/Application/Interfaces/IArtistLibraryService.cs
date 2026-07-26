using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Interfaces;

public interface IArtistLibraryService
{
    Task<IList<ArtistSummary>> GetFollowedLibraryArtistsAsync(
        IList<SavedTrack> tracks,
        ISet<string> followedArtistIds);
}
