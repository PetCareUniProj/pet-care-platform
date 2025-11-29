using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Buyers;

namespace Ordering.Infrastructure.EntityConfigurations;

internal sealed class CardTypeEntityTypeConfiguration
    : IEntityTypeConfiguration<CardType>
{
    public void Configure(EntityTypeBuilder<CardType> cardTypesConfiguration)
    {
        cardTypesConfiguration.Property(ct => ct.Id)
            .ValueGeneratedNever();

        cardTypesConfiguration.Property(ct => ct.Name)
            .HasMaxLength(200)
            .IsRequired();
    }
}
