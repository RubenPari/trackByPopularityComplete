using Microsoft.EntityFrameworkCore;
using tracksByPopularity.Application.Interfaces;
using Snapshot = tracksByPopularity.Domain.Entities.PlaylistSnapshot;

namespace tracksByPopularity.Infrastructure.Data;

public class PlaylistSnapshotRepository(AppDbContext dbContext) : IPlaylistSnapshotRepository
{
    public async Task AddAsync(Snapshot snapshot)
    {
        dbContext.PlaylistSnapshots.Add(snapshot);
        await dbContext.SaveChangesAsync();
    }

    public async Task<IList<Snapshot>> GetByUserAsync(string spotifyUserId)
    {
        return await dbContext.PlaylistSnapshots
            .AsNoTracking()
            .Include(snapshot => snapshot.Tracks)
            .Where(snapshot => snapshot.SpotifyUserId == spotifyUserId)
            .OrderByDescending(snapshot => snapshot.CreatedAt)
            .ToListAsync();
    }

    public async Task<Snapshot?> GetByIdAsync(
        Guid snapshotId,
        string spotifyUserId,
        bool includeTracks = false)
    {
        IQueryable<Snapshot> query = dbContext.PlaylistSnapshots;
        if (includeTracks)
        {
            query = query.Include(snapshot => snapshot.Tracks);
        }

        return await query.FirstOrDefaultAsync(snapshot =>
            snapshot.Id == snapshotId && snapshot.SpotifyUserId == spotifyUserId);
    }

    public async Task DeleteAsync(Snapshot snapshot)
    {
        dbContext.PlaylistSnapshots.Remove(snapshot);
        await dbContext.SaveChangesAsync();
    }

    public Task<int> DeleteOlderThanAsync(DateTime cutoffDate) => dbContext.PlaylistSnapshots
        .Where(snapshot => snapshot.CreatedAt < cutoffDate)
        .ExecuteDeleteAsync();
}
