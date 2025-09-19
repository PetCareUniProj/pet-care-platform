using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Catalog.Infrastructure.Brands;
internal sealed class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .UseIdentityAlwaysColumn();

        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
    }
}
