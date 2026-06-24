using dotenv.net;
using Microsoft.EntityFrameworkCore;
using Serilog;
using tracksByPopularity.Application.Configuration;
using tracksByPopularity.Application.DependencyInjection;
using tracksByPopularity.Infrastructure.Data;
using tracksByPopularity.Infrastructure.DependencyInjection;
using tracksByPopularity.Infrastructure.HealthChecks;
using tracksByPopularity.Presentation.DependencyInjection;

DotEnv.Load();

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for logging
builder.Host.UseSerilog((context, services, loggerConfig) =>
{
    loggerConfig
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .MinimumLevel.Debug()
        .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Information)
        .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
        .MinimumLevel.Override("System", Serilog.Events.LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .WriteTo.Console(
            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
        .WriteTo.File(
            formatter: new Serilog.Formatting.Compact.CompactJsonFormatter(),
            path: "logs/tracks-by-popularity-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 30,
            shared: true
        );
});

// Configure strongly-typed settings (from appsettings.json + environment variables)
builder.Services.AddApplicationConfiguration(builder.Configuration);

// Resolve the MySQL connection string. It must be provided via environment variable or configuration.
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
    ?? builder.Configuration.GetSection("DatabaseSettings")["ConnectionString"]
    ?? throw new InvalidOperationException("DATABASE_CONNECTION_STRING not set");

// Layered service registration
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration, connectionString);
builder.Services.AddPresentationServices(builder.Configuration);

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database")
    .AddCheck<RedisHealthCheck>("redis")
    .AddCheck<SpotifyHealthCheck>("spotify");

var app = builder.Build();

// Apply pending EF Core migrations.
// Safe default: migrate automatically in Development, otherwise require explicit opt-in.
var migrateOnStartup =
    builder.Environment.IsDevelopment() ||
    string.Equals(Environment.GetEnvironmentVariable("MIGRATE_ON_STARTUP"), "true", StringComparison.OrdinalIgnoreCase);

if (migrateOnStartup)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Pipeline: presentation middlewares (exception handling, response caching), then CORS.
app.AddPresentationPipeline();
app.UseCors("Frontend");
app.MapControllers();
app.MapHealthChecks("/api/health");

try
{
    app.Run();
}
finally
{
    // Ensure Serilog flushes on application shutdown
    Log.CloseAndFlush();
}
