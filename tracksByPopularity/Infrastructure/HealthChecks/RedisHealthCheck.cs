using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace tracksByPopularity.Infrastructure.HealthChecks;

/// <summary>
/// Health check that verifies Redis connectivity by pinging the server.
/// </summary>
public class RedisHealthCheck : IHealthCheck
{
    private readonly IConnectionMultiplexer _redis;

    public RedisHealthCheck(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var database = _redis.GetDatabase();
            await database.PingAsync(CommandFlags.None);
            return HealthCheckResult.Healthy("Redis is reachable.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Redis connection failed.", ex);
        }
    }
}
