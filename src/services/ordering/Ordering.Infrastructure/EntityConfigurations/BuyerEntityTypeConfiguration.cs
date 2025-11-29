using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Buyers;

namespace Ordering.Infrastructure.EntityConfigurations;

internal sealed class BuyerEntityTypeConfiguration
    : IEntityTypeConfiguration<Buyer>
{
    public void Configure(EntityTypeBuilder<Buyer> builder)
    {
        builder.Ignore(b => b.DomainEvents);

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.Email).IsRequired();
        builder.HasMany(b => b.PaymentMethods).WithOne();

    }
}
