using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Abstractions.Data;

public interface IApplicationDbContext
{
    DbSet<Item> Items { get; }
    DbSet<Brand> Brands { get; }
    DbSet<Domain.Entities.Category> Categories { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}