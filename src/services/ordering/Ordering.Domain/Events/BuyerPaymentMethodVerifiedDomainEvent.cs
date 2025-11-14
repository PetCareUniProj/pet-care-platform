namespace Ordering.Domain.Events;

public sealed record BuyerAndPaymentMethodVerifiedDomainEvent(Buyer Buyer, PaymentMethod Payment, int OrderId)
    : IDomainEvent;