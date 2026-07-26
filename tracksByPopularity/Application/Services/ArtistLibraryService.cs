using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Services;

public class ArtistLibraryService : IArtistLibraryService
{
    public Task<IList<ArtistSummary>> GetFollowedLibraryArtistsAsync(
        IList<SavedTrack> tracks,
        ISet<string> followedArtistIds)
    {
        IList<ArtistSummary> artists = tracks
            .SelectMany(savedTrack => savedTrack.Track.Artists.Select(artist => new
            {
                artist.Id,
                artist.Name,
                TrackId = savedTrack.Track.Id
            }))
            .Where(artist => followedArtistIds.Contains(artist.Id))
            .GroupBy(artist => artist.Id)
            .Select(group => new ArtistSummary
            {
                Id = group.Key,
                Name = group.First().Name,
                Count = group.Select(artist => artist.TrackId).Distinct().Count()
            })
            .OrderByDescending(artist => artist.Count)
            .ToList();

        return Task.FromResult(artists);
    }
}
