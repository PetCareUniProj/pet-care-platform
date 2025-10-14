using Microsoft.EntityFrameworkCore;
using Ordering.Infrastructure.Database;

namespace Ordering.Api.Extensions;

public static class MigrationExtensions
{
    public static void ApplyMigrations(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();

        using var dbContext =
            scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.EnsureDeleted();
        dbContext.Database.Migrate();
    }
}
