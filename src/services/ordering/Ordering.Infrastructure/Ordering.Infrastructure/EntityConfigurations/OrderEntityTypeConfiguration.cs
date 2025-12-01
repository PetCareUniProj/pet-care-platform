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
        builder.Ignore(b => b.DomainEvents);

        builder.Property(o => o.Id)
            .UseHiLo("orderseq");
        //Address value object persisted as owned entity type supported since EF Core 2.0
        builder.OwnsOne(o => o.Address, a =>
        {
            a.Property(ad => ad.Street).HasColumnName("address_street").IsRequired();
            a.Property(ad => ad.City).HasColumnName("address_city").IsRequired();
            a.Property(ad => ad.State).HasColumnName("address_state").IsRequired();
            a.Property(ad => ad.Country).HasColumnName("address_country").IsRequired();
            a.Property(ad => ad.ZipCode).HasColumnName("address_zip_code").IsRequired();
        });

        builder.Property(o => o.OrderDate)
            .HasConversion(d => d != null ? DateTime.SpecifyKind(d, DateTimeKind.Utc) : d, v => v);

        builder.Property(o => o.NextRecurrenceDate)
            .HasConversion(d => d != null ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : d, v => v);

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
