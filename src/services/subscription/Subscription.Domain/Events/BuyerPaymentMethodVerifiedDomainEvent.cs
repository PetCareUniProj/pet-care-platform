namespace Subscription.Domain.Events;

public sealed record BuyerAndPaymentMethodVerifiedDomainEvent(Buyer Buyer, PaymentMethod Payment, int SubscriptionId)
    : IDomainEvent;

