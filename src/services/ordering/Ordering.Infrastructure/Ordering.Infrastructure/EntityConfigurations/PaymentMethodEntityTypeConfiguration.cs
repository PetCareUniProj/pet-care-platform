using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Buyers;

namespace Ordering.Infrastructure.EntityConfigurations;
internal sealed class PaymentMethodEntityTypeConfiguration
        : IEntityTypeConfiguration<PaymentMethod>
{
    public void Configure(EntityTypeBuilder<PaymentMethod> builder)
    {
        builder.Ignore(b => b.DomainEvents);

        builder.Property(pm => pm.Id)
            .UseHiLo("paymentseq");

        builder.Property<Guid>("BuyerId");

        builder
            .Property("_cardHolderName")
            .HasColumnName("CardHolderName")
            .HasMaxLength(200);

        builder
            .Property("_alias")
            .HasColumnName("Alias")
            .HasMaxLength(200);

        builder
            .Property("_cardNumber")
            .HasColumnName("CardNumber")
            .HasMaxLength(25)
            .IsRequired();

        builder
            .Property("_expiration")
            .HasColumnName("Expiration")
            .HasMaxLength(25);

        builder
            .Property("_cardTypeId")
            .HasColumnName("CardTypeId");

        builder.HasOne(p => p.CardType)
            .WithMany()
            .HasForeignKey("_cardTypeId");
    }
}
