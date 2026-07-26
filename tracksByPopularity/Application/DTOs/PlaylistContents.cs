namespace tracksByPopularity.Application.DTOs;

public sealed record PlaylistContents(string Name, IList<string> TrackUris);
