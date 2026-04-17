using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace tracksByPopularity.Infrastructure.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
            ?? "Server=localhost;Port=3306;Database=tracksbypopularity;User=root;Password=password;";

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        // Match the runtime provider/version used in Program.cs (MariaDB 11).
        optionsBuilder.UseMySql(connectionString, new MariaDbServerVersion(new Version(11, 0)));

        return new AppDbContext(optionsBuilder.Options);
    }
}
