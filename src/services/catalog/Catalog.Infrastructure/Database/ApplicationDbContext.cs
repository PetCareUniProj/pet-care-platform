using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Infrastructure.Database;
public sealed class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public DbSet<Item> CatalogItems { get; set; }

    public DbSet<Brand> CatalogBrands { get; set; }

    public DbSet<Category> CatalogCategories { get; set; }
    private readonly IMediator _mediator;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IMediator mediator)
        : base(options)
    {
        _mediator = mediator;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.HasDefaultSchema(Schemas.Default);
    }
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);
        //TODO: DOMAIN EVENTS???
        return result;
    }
}
