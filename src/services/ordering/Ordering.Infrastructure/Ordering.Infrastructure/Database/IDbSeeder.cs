using Microsoft.EntityFrameworkCore;

namespace Ordering.Infrastructure.Database;
public interface IDbSeeder<in TContext> where TContext : DbContext
{
    Task SeedAsync(TContext context);
}
