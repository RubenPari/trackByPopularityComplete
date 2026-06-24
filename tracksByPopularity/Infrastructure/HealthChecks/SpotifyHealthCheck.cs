using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using tracksByPopularity.Application.Configuration;

namespace tracksByPopularity.Infrastructure.HealthChecks;

/// <summary>
/// Health check that verifies Spotify OAuth configuration.
/// Does not perform an actual Spotify API call because no user context is available.
/// </summary>
public class SpotifyHealthCheck : IHealthCheck
{
    private readonly SpotifySettings _settings;

    public SpotifyHealthCheck(IOptions<SpotifySettings> options)
    {
        _settings = options.Value;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.ClientId) ||
            string.IsNullOrWhiteSpace(_settings.ClientSecret) ||
            string.IsNullOrWhiteSpace(_settings.RedirectUri))
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Spotify OAuth settings are not configured."));
        }

        return Task.FromResult(HealthCheckResult.Healthy("Spotify OAuth settings are configured."));
    }
}
