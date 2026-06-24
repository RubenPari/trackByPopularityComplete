using SpotifyAPI.Web;

namespace tracksByPopularity.Application.Helpers;

/// <summary>
/// Contains application-wide constants and configuration values.
/// </summary>
public abstract class Constants
{
    /// <summary>
    /// The default Spotify scopes required for the application to function.
    /// </summary>
    public static List<string> MyScopes { get; } =
    [
        Scopes.UserReadEmail,
        Scopes.UserReadPrivate,
        Scopes.UserLibraryRead,
        Scopes.UserLibraryModify,
        Scopes.UserTopRead,
        Scopes.PlaylistModifyPrivate,
        Scopes.PlaylistModifyPublic,
        Scopes.UserFollowRead,
    ];
}
