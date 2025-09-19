using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Abstractions.Data;

public interface IApplicationDbContext
{
    DbSet<Item> CatalogItems { get; }
    DbSet<Brand> CatalogBrands { get; }
    DbSet<Category> CatalogCategories { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
