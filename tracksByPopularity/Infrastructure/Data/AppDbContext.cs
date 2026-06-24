using Microsoft.EntityFrameworkCore;
using tracksByPopularity.Domain.Entities;

namespace tracksByPopularity.Infrastructure.Data;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Domain.Entities.PlaylistSnapshot> PlaylistSnapshots => Set<Domain.Entities.PlaylistSnapshot>();
    public DbSet<SnapshotTrack> SnapshotTracks => Set<SnapshotTrack>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Domain.Entities.PlaylistSnapshot>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SpotifyUserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.PlaylistId).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PlaylistName).IsRequired().HasMaxLength(512);
            entity.Property(e => e.OperationType).IsRequired().HasMaxLength(64);
            entity.Property(e => e.SpotifyUserId).IsRequired().HasMaxLength(256);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<SnapshotTrack>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SnapshotId);
            entity.Property(e => e.TrackUri).IsRequired().HasMaxLength(512);
            entity.Property(e => e.SnapshotId).IsRequired();

            entity.HasOne(e => e.Snapshot)
                .WithMany(s => s.Tracks)
                .HasForeignKey(e => e.SnapshotId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
