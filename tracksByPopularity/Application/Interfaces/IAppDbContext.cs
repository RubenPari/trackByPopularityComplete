using Microsoft.EntityFrameworkCore;
using tracksByPopularity.Domain.Entities;

namespace tracksByPopularity.Application.Interfaces;

/// <summary>
/// Unit-of-work abstraction over the application's persistence context.
/// Implemented by <c>AppDbContext</c> in Infrastructure so Application services
/// depend on the abstraction instead of the concrete EF context.
/// </summary>
public interface IAppDbContext
{
    DbSet<Domain.Entities.PlaylistSnapshot> PlaylistSnapshots { get; }
    DbSet<SnapshotTrack> SnapshotTracks { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
