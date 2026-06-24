namespace tracksByPopularity.Presentation.Controllers;

/// <summary>
/// Helper class for constructing and validating Spotify redirect URIs.
/// </summary>
internal static class SpotifyRedirectUriHelper
{
    private const string AuthCallbackPath = "/auth/callback";
    private const string LinkCallbackPath = "/api/spotify/callback";

    /// <summary>
    /// Gets the redirect URI for the Spotify authentication callback.
    /// </summary>
    /// <param name="configuredRedirectUri">The base redirect URI from configuration.</param>
    /// <returns>A fully qualified absolute URI for the auth callback.</returns>
    public static Uri GetAuthCallbackUri(string configuredRedirectUri)
        => BuildCallbackUri(configuredRedirectUri, AuthCallbackPath);

    /// <summary>
    /// Gets the redirect URI for the Spotify account linking callback.
    /// </summary>
    /// <param name="configuredRedirectUri">The base redirect URI from configuration.</param>
    /// <returns>A fully qualified absolute URI for the link callback.</returns>
    public static Uri GetLinkCallbackUri(string configuredRedirectUri)
        => BuildCallbackUri(configuredRedirectUri, LinkCallbackPath);

    /// <summary>
    /// Builds a callback URI by appending the specific callback path to the normalized base URI.
    /// </summary>
    /// <param name="configuredRedirectUri">The base redirect URI from configuration.</param>
    /// <param name="callbackPath">The specific callback path to append.</param>
    /// <returns>A fully qualified absolute URI.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the configured redirect URI is missing or invalid.</exception>
    private static Uri BuildCallbackUri(string configuredRedirectUri, string callbackPath)
    {
        if (string.IsNullOrWhiteSpace(configuredRedirectUri))
        {
            throw new InvalidOperationException("Spotify RedirectUri configuration is missing.");
        }

        var normalizedBaseUri = configuredRedirectUri.TrimEnd('/');

        if (normalizedBaseUri.EndsWith(AuthCallbackPath, StringComparison.OrdinalIgnoreCase))
        {
            normalizedBaseUri = normalizedBaseUri[..^AuthCallbackPath.Length];
        }
        else if (normalizedBaseUri.EndsWith(LinkCallbackPath, StringComparison.OrdinalIgnoreCase))
        {
            normalizedBaseUri = normalizedBaseUri[..^LinkCallbackPath.Length];
        }

        return new Uri($"{normalizedBaseUri}{callbackPath}", UriKind.Absolute);
    }
}
