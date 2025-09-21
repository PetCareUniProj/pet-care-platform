using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Catalog.Infrastructure.Items;
internal sealed class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.ToTable("items");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .UseIdentityAlwaysColumn();

        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        builder.HasOne(b => b.CatalogBrand)
            .WithMany(i => i.Items)
            .HasForeignKey(x => x.CatalogBrandId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(с => с.Categories)
            .WithMany(i => i.Items)
            .UsingEntity(
                "catalog_item_categories",
                l => l.HasOne(typeof(Category)).WithMany().HasForeignKey("category_id").HasPrincipalKey(nameof(Category.Id)).OnDelete(DeleteBehavior.Restrict),
                r => r.HasOne(typeof(Item)).WithMany().HasForeignKey("item_id").HasPrincipalKey(nameof(Item.Id)).OnDelete(DeleteBehavior.Restrict),
                j => j.HasKey("item_id", "category_id"));
    }
}
