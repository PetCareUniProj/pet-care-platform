using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Abstractions.Data;

public interface IApplicationDbContext
{
    DbSet<CatalogItem> CatalogItems { get; }
    DbSet<CatalogBrand> CatalogBrands { get; }
    DbSet<CatalogCategory> CatalogCategories { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
