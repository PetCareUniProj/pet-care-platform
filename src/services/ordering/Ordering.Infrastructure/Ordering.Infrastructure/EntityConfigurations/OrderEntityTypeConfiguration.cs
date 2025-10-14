using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Buyers;
using Ordering.Domain.Orders;

namespace Ordering.Infrastructure.EntityConfigurations;
internal sealed class OrderEntityTypeConfiguration
    : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id)
            .UseIdentityColumn();
        //Address value object persisted as owned entity type supported since EF Core 2.0
        builder
            .OwnsOne(o => o.Address);

        builder
            .Property(o => o.OrderStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder
            .Property(o => o.PaymentId)
            .HasColumnName("PaymentMethodId");

        builder.HasOne<PaymentMethod>()
            .WithMany()
            .HasForeignKey(o => o.PaymentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Buyer)
            .WithMany()
            .HasForeignKey(o => o.BuyerId);
    }
}
