using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Subscription.Domain.Subscriptions;

namespace Subscription.Infrastructure.EntityConfigurations;
internal sealed class SubscriptionItemEntityTypeConfiguration
    : IEntityTypeConfiguration<SubscriptionItem>
{
    public void Configure(EntityTypeBuilder<SubscriptionItem> builder)
    {
        builder.Ignore(b => b.DomainEvents);

        builder.Property(o => o.Id)
            .UseHiLo("Subscriptionitemseq");

        builder.Property<int>("SubscriptionId");
    }
}


