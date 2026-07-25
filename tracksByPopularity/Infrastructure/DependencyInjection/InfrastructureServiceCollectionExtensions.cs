using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

using tracksByPopularity.Application.Interfaces;

namespace tracksByPopularity.Infrastructure.DependencyInjection;

/// <summary>
/// Extension methods for registering Infrastructure-layer services
/// (database, Redis cache, Spotify auth, background services).
/// </summary>
public static class InfrastructureServiceCollectionExtensions
{
    /// <summary>
    /// Registers infrastructure services.
    /// </summary>
    /// <param name="connectionString">The resolved MySQL connection string.</param>
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        // MySQL database context
        services.AddDbContext<AppDbContext>(options =>
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        // Spotify auth
        services.AddScoped<ISpotifyAuthService, SpotifyAuthService>();

        // Infrastructure application services backed by external resources
        services.AddScoped<IPlaylistBackupService, PlaylistBackupService>();

        // Redis connection
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var redisSettings = sp.GetRequiredService<IOptions<RedisSettings>>().Value;

            var configurationOptions = new ConfigurationOptions
            {
                EndPoints = { $"{redisSettings.Host}:{redisSettings.Port}" },
                Password = redisSettings.Password,
                Ssl = redisSettings.UseSsl,
                AllowAdmin = false, // Disabled for security, use pattern-based deletion instead
                AbortOnConnectFail = false,
                ConnectTimeout = 10000, // 10 seconds
                SyncTimeout = 10000, // 10 seconds
                AsyncTimeout = 10000, // 10 seconds
                ReconnectRetryPolicy = new LinearRetry(5000), // 5 seconds retry
                ConnectRetry = 3,
                KeepAlive = 60, // Send keepalive every 60 seconds
            };

            return ConnectionMultiplexer.Connect(configurationOptions);
        });

        // Cache infrastructure (DIP: depends on abstraction ICacheRepository)
        services.AddSingleton<ICacheRepository, RedisCacheRepository>();

        // Cache services (ISP: separate interfaces for each cache type)
        services.AddScoped<ITrackCacheService, TrackCacheService>();
        services.AddScoped<IPlaylistCacheService, PlaylistCacheService>();
        services.AddScoped<IArtistCacheService, ArtistCacheService>();

        // Background services
        services.AddHostedService<SnapshotCleanupService>();

        services.AddHttpClient();

        return services;
    }
}