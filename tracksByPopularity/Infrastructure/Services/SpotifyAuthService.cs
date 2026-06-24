using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Serialization;
using SpotifyAPI.Web;
using StackExchange.Redis;
using tracksByPopularity.Application.Configuration;

namespace tracksByPopularity.Infrastructure.Services;

public class SpotifyAuthService(IConnectionMultiplexer redis, IOptions<SpotifySettings> spotifySettings) : ISpotifyAuthService
{
    private readonly SpotifySettings _spotifySettings = spotifySettings.Value;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public SpotifyClient GetSpotifyClient()
    {
        var config = SpotifyClientConfig
            .CreateDefault()
            .WithAuthenticator(
                new ClientCredentialsAuthenticator(_spotifySettings.ClientId, _spotifySettings.ClientSecret)
            );

        return new SpotifyClient(config);
    }

    public async Task<SpotifyClient> GetSpotifyClientForUserAsync(string userId)
    {
        var db = redis.GetDatabase();
        var tokenJson = await db.StringGetAsync($"spotify_token:{userId}");

        if (!tokenJson.HasValue)
        {
            throw new UnauthorizedAccessException("Spotify token not found for user");
        }

        var token = JsonSerializer.Deserialize<TokenData>(tokenJson.ToString(), JsonOptions);
        if (token is null)
        {
            await RemoveTokenAsync(userId);
            throw new UnauthorizedAccessException("Invalid Spotify token stored for user");
        }

        // Check if token is expired (with 5 minutes buffer)
        if (token.CreatedAt.AddSeconds(token.ExpiresIn - 300) < DateTime.UtcNow)
        {
            token = await RefreshTokenAsync(token.RefreshToken, userId);
        }

        if (string.IsNullOrWhiteSpace(token.AccessToken))
        {
            await RemoveTokenAsync(userId);
            throw new UnauthorizedAccessException("Spotify access token is missing");
        }

        return new SpotifyClient(SpotifyClientConfig.CreateDefault().WithToken(token.AccessToken));
    }

    public async Task StoreTokenAsync(AuthorizationCodeTokenResponse response, string userId)
    {
        var tokenData = new TokenData
        {
            AccessToken = response.AccessToken,
            TokenType = response.TokenType,
            ExpiresIn = response.ExpiresIn,
            RefreshToken = response.RefreshToken,
            Scope = response.Scope,
            CreatedAt = DateTime.UtcNow,
        };

        var db = redis.GetDatabase();

        await db.StringSetAsync(
            $"spotify_token:{userId}",
            JsonSerializer.Serialize(tokenData, JsonOptions),
            TimeSpan.FromDays(30)
        );
    }

    public async Task RemoveTokenAsync(string userId)
    {
        var db = redis.GetDatabase();
        await db.KeyDeleteAsync($"spotify_token:{userId}");
    }

    private async Task<TokenData> RefreshTokenAsync(string? refreshToken, string userId)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            await RemoveTokenAsync(userId);
            throw new UnauthorizedAccessException("Spotify refresh token is missing");
        }

        try
        {
            var newToken = await new OAuthClient().RequestToken(
                new AuthorizationCodeRefreshRequest(
                    _spotifySettings.ClientId,
                    _spotifySettings.ClientSecret,
                    refreshToken
                )
            );

            var tokenData = new TokenData
            {
                AccessToken = newToken.AccessToken,
                TokenType = newToken.TokenType,
                ExpiresIn = newToken.ExpiresIn,
                RefreshToken = newToken.RefreshToken ?? refreshToken,
                Scope = newToken.Scope,
                CreatedAt = DateTime.UtcNow,
            };

            var db = redis.GetDatabase();
            await db.StringSetAsync(
                $"spotify_token:{userId}",
                JsonSerializer.Serialize(tokenData, JsonOptions),
                TimeSpan.FromDays(30)
            );

            return tokenData;
        }
        catch (Exception)
        {
            await RemoveTokenAsync(userId);
            throw new UnauthorizedAccessException("Failed to refresh Spotify token");
        }
    }
}

public class TokenData
{
    public string? AccessToken { get; init; }
    public string? TokenType { get; set; }
    public int ExpiresIn { get; init; }
    public string? RefreshToken { get; init; }
    public string? Scope { get; set; }
    public DateTime CreatedAt { get; init; }
}
