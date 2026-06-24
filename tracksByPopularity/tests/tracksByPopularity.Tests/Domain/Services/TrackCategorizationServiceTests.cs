using tracksByPopularity.Domain.Entities;
using tracksByPopularity.Domain.Exceptions;
using tracksByPopularity.Domain.Services;
using tracksByPopularity.Domain.ValueObjects;

namespace tracksByPopularity.Tests.Domain.Services;

public class TrackCategorizationServiceTests
{
    private readonly TrackCategorizationService _service = new();

    [Fact]
    public void CategorizeByPopularity_WithLessRange_ReturnsTracksWithPopularityZeroToTwenty()
    {
        var tracks = new List<Track>
        {
            new() { Id = "1", Name = "A", Popularity = 0, Artists = [new Artist { Id = "a", Name = "Artist A" }] },
            new() { Id = "2", Name = "B", Popularity = 20, Artists = [new Artist { Id = "a", Name = "Artist A" }] },
            new() { Id = "3", Name = "C", Popularity = 21, Artists = [new Artist { Id = "a", Name = "Artist A" }] },
        };

        var result = _service.CategorizeByPopularity(tracks, PopularityRange.Less).ToList();

        Assert.Equal(2, result.Count);
        Assert.Contains(result, t => t.Id == "1");
        Assert.Contains(result, t => t.Id == "2");
    }

    [Fact]
    public void CategorizeByPopularity_WithEmptyTracks_ReturnsEmpty()
    {
        var result = _service.CategorizeByPopularity([], PopularityRange.More);

        Assert.Empty(result);
    }

    [Fact]
    public void CategorizeArtistTracks_WithMatchingArtist_ReturnsLessMediumMoreGroups()
    {
        var artistId = "artist-1";
        var otherArtist = new Artist { Id = "artist-2", Name = "Other" };
        var tracks = new List<Track>
        {
            new() { Id = "1", Popularity = 10, Artists = [new Artist { Id = artistId, Name = "A" }] },
            new() { Id = "2", Popularity = 50, Artists = [new Artist { Id = artistId, Name = "A" }] },
            new() { Id = "3", Popularity = 80, Artists = [new Artist { Id = artistId, Name = "A" }] },
            new() { Id = "4", Popularity = 10, Artists = [otherArtist] },
        };

        var result = _service.CategorizeArtistTracks(tracks, artistId);

        Assert.Single(result["less"]);
        Assert.Single(result["medium"]);
        Assert.Single(result["more"]);
        Assert.Equal("1", result["less"][0].Id);
        Assert.Equal("2", result["medium"][0].Id);
        Assert.Equal("3", result["more"][0].Id);
    }

    [Fact]
    public void CategorizeArtistTracks_WithNoMatchingArtist_ReturnsEmptyGroups()
    {
        var tracks = new List<Track>
        {
            new() { Id = "1", Popularity = 10, Artists = [new Artist { Id = "other", Name = "Other" }] },
        };

        var result = _service.CategorizeArtistTracks(tracks, "missing");

        Assert.Empty(result["less"]);
        Assert.Empty(result["medium"]);
        Assert.Empty(result["more"]);
    }
}
