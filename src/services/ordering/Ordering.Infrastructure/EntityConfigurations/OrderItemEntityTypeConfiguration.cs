using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Orders;

namespace Ordering.Infrastructure.EntityConfigurations;

internal sealed class OrderItemEntityTypeConfiguration
    : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.Ignore(b => b.DomainEvents);

        builder.Property(o => o.Id)
            .UseHiLo("orderitemseq");

        builder.Property<int>("OrderId");
    }
}
