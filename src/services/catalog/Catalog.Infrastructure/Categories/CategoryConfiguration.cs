using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Catalog.Infrastructure.Categories;
internal sealed class ItemConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .UseIdentityAlwaysColumn();

        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.HasIndex(x => x.Name).IsUnique();
    }
}
