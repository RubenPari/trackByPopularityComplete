using tracksByPopularity.Domain.Exceptions;
using tracksByPopularity.Domain.ValueObjects;

namespace tracksByPopularity.Tests.Domain.ValueObjects;

public class PopularityRangeTests
{
    [Fact]
    public void Constructor_WithValidRange_SetsMinAndMax()
    {
        var range = new PopularityRange(10, 50);

        Assert.Equal(10, range.Min);
        Assert.Equal(50, range.Max);
    }

    [Theory]
    [InlineData(0, 100)]
    [InlineData(50, 50)]
    [InlineData(21, 40)]
    public void Constructor_WithValidBounds_DoesNotThrow(int min, int max)
    {
        var exception = Record.Exception(() => new PopularityRange(min, max));
        Assert.Null(exception);
    }

    [Theory]
    [InlineData(-1, 50)]
    [InlineData(0, 101)]
    [InlineData(50, 30)]
    public void Constructor_WithInvalidRange_ThrowsInvalidPopularityRangeException(int min, int max)
    {
        Assert.Throws<InvalidPopularityRangeException>(() => new PopularityRange(min, max));
    }

    [Theory]
    [InlineData(0, 20, 0, true)]
    [InlineData(0, 20, 20, true)]
    [InlineData(0, 20, 21, false)]
    [InlineData(0, 20, -1, false)]
    public void Contains_ReturnsExpectedResult(int min, int max, int value, bool expected)
    {
        var range = new PopularityRange(min, max);

        Assert.Equal(expected, range.Contains(value));
    }

    [Fact]
    public void PredefinedRanges_HaveExpectedBounds()
    {
        Assert.Equal(0, PopularityRange.Less.Min);
        Assert.Equal(20, PopularityRange.Less.Max);

        Assert.Equal(21, PopularityRange.LessMedium.Min);
        Assert.Equal(40, PopularityRange.LessMedium.Max);

        Assert.Equal(41, PopularityRange.Medium.Min);
        Assert.Equal(60, PopularityRange.Medium.Max);

        Assert.Equal(61, PopularityRange.MoreMedium.Min);
        Assert.Equal(80, PopularityRange.MoreMedium.Max);

        Assert.Equal(81, PopularityRange.More.Min);
        Assert.Equal(100, PopularityRange.More.Max);
    }

    [Fact]
    public void ArtistRanges_HaveExpectedBounds()
    {
        Assert.Equal(0, PopularityRange.ArtistLess.Min);
        Assert.Equal(33, PopularityRange.ArtistLess.Max);

        Assert.Equal(34, PopularityRange.ArtistMedium.Min);
        Assert.Equal(66, PopularityRange.ArtistMedium.Max);

        Assert.Equal(67, PopularityRange.ArtistMore.Min);
        Assert.Equal(100, PopularityRange.ArtistMore.Max);
    }
}
