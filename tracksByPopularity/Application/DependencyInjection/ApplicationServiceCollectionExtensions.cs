using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace tracksByPopularity.Application.DependencyInjection;

/// <summary>
/// Extension methods for registering Application-layer services and configuration.
/// </summary>
public static class ApplicationServiceCollectionExtensions
{
    /// <summary>
    /// Registers strongly-typed settings from configuration sources and environment variables.
    /// </summary>
    public static void AddApplicationConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        // Bind configuration sections to strongly-typed settings classes
        services.Configure<AppSettings>(configuration.GetSection("AppSettings"));
        services.Configure<SpotifySettings>(configuration.GetSection("SpotifySettings"));
        services.Configure<RedisSettings>(configuration.GetSection("RedisSettings"));
        services.Configure<DatabaseSettings>(configuration.GetSection("DatabaseSettings"));

        // Also bind from environment variables as fallback
        services.Configure<AppSettings>(options =>
        {
            options.FrontendOrigin = Environment.GetEnvironmentVariable("FRONTEND_ORIGIN") ?? options.FrontendOrigin;
            options.ClearSongsBaseUrl = Environment.GetEnvironmentVariable("CLEAR_SONGS_BASE_URL") ?? options.ClearSongsBaseUrl;
            options.TrackSummaryBaseUrl = Environment.GetEnvironmentVariable("TRACK_SUMMARY_BASE_URL") ?? options.TrackSummaryBaseUrl;
        });

        services.Configure<SpotifySettings>(options =>
        {
            options.ClientId = Environment.GetEnvironmentVariable("CLIENT_ID") ?? options.ClientId;
            options.ClientSecret = Environment.GetEnvironmentVariable("CLIENT_SECRET") ?? options.ClientSecret;
            options.RedirectUri = Environment.GetEnvironmentVariable("REDIRECT_URI") ?? options.RedirectUri;
        });

        services.Configure<RedisSettings>(options =>
        {
            options.Host = Environment.GetEnvironmentVariable("REDIS_HOST") ?? options.Host;
            options.Port = Environment.GetEnvironmentVariable("REDIS_PORT") ?? options.Port;
            options.Password = Environment.GetEnvironmentVariable("REDIS_PASSWORD") ?? options.Password;
            if (bool.TryParse(Environment.GetEnvironmentVariable("REDIS_USE_SSL"), out var useSsl))
                options.UseSsl = useSsl;
        });

        services.Configure<DatabaseSettings>(options =>
        {
            options.ConnectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ?? options.ConnectionString;
        });
    }

    /// <summary>
    /// Registers Application-layer services (pure application services and Spotify-coupled services).
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ITrackService, TrackService>();
        services.AddScoped<IPlaylistService, PlaylistService>();
        services.AddScoped<IPlaylistHelper, PlaylistHelperService>();
        services.AddScoped<ITrackCategorizationService, TrackCategorizationService>();
        services.AddScoped<IPlaylistOrganizationService, PlaylistOrganizationService>();
        services.AddScoped<ITrackOrganizationService, TrackOrganizationService>();
        services.AddScoped<IArtistTrackOrganizationService, ArtistTrackOrganizationService>();
        return services;
    }
}
