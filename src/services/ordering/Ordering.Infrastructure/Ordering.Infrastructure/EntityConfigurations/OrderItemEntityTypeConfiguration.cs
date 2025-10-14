using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Orders;

namespace Ordering.Infrastructure.EntityConfigurations;
internal sealed class OrderItemEntityTypeConfiguration
    : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id)
            .UseIdentityColumn();
        builder.Ignore(b => b.DomainEvents);
        builder.Property<int>("OrderId");
    }
}
