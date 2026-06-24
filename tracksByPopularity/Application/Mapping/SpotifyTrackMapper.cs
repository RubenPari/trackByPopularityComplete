using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Mapping;

/// <summary>
/// Mapper for converting between Spotify API models and domain entities.
/// This isolates infrastructure concerns (Spotify SDK) from domain logic.
/// </summary>
public static class SpotifyTrackMapper
{
    /// <summary>
    /// Converts a Spotify SavedTrack to a domain Track entity.
    /// </summary>
    /// <param name="savedTrack">The Spotify SavedTrack to convert.</param>
    /// <returns>A domain Track entity.</returns>
    private static Track ToDomain(SavedTrack savedTrack)
    {
        return new Track
        {
            Id = savedTrack.Track.Id,
            Name = savedTrack.Track.Name,
            Popularity = savedTrack.Track.Popularity,
            Uri = savedTrack.Track.Uri,
            Artists = savedTrack.Track.Artists.Select(artist => new Artist
            {
                Id = artist.Id,
                Name = artist.Name,
            }).ToList(),
        };
    }

    /// <summary>
    /// Converts a collection of Spotify SavedTracks to domain Track entities.
    /// </summary>
    public static IEnumerable<Track> ToDomain(IEnumerable<SavedTrack> savedTracks)
    {
        return savedTracks.Select(ToDomain);
    }

    /// <summary>
    /// Filters the original Spotify SavedTracks to return only those matching the selected domain tracks.
    /// </summary>
    public static IEnumerable<SavedTrack> ToSavedTracks(
        IEnumerable<SavedTrack> allSavedTracks,
        IEnumerable<Track> selectedDomainTracks)
    {
        var selectedIds = selectedDomainTracks.Select(t => t.Id).ToHashSet();
        return allSavedTracks.Where(st => selectedIds.Contains(st.Track.Id));
    }
}

