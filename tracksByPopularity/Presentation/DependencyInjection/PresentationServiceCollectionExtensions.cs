using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using tracksByPopularity.Presentation.Middlewares;
namespace tracksByPopularity.Presentation.DependencyInjection;

/// <summary>
/// Extension methods for registering Presentation-layer services and pipeline middleware.
/// </summary>
public static class PresentationServiceCollectionExtensions
{
    /// <summary>
    /// Registers controllers, FluentValidation, CORS and response caching.
    /// </summary>
    public static IServiceCollection AddPresentationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            });

        services.AddFluentValidationAutoValidation();
        services.AddFluentValidationClientsideAdapters();
        services.AddValidatorsFromAssemblyContaining<AddTracksByArtistRequestValidator>();

        var allowedOrigins = new[]
        {
            Environment.GetEnvironmentVariable("FRONTEND_ORIGIN"),
            configuration["AppSettings:FrontendOrigin"],
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        }
        .OfType<string>()
        .Where(origin => !string.IsNullOrWhiteSpace(origin))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

        services.AddCors(options =>
        {
            options.AddPolicy("Frontend", policy =>
            {
                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        services.AddResponseCaching();

        return services;
    }

    /// <summary>
    /// Registers Presentation pipeline middleware that must run before CORS/auth.
    /// </summary>
    public static WebApplication AddPresentationPipeline(this WebApplication app)
    {
        app.UseGlobalExceptionHandling();
        app.UseResponseCaching();
        return app;
    }
}
