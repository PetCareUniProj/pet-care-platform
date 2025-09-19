using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Catalog.Infrastructure.Catalog.Brands;
internal sealed class BrandConfiguration : IEntityTypeConfiguration<CatalogBrand>
{
    public void Configure(EntityTypeBuilder<CatalogBrand> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .UseIdentityAlwaysColumn();

        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
    }
}
