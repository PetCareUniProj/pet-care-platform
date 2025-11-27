using SubscriptionAggregate = Subscription.Domain.Subscriptions.Subscription;

namespace Subscription.Domain.Events;

/// <summary>
/// Event used when an Subscription is created
/// </summary>
public sealed record SubscriptionStartedDomainEvent(
    SubscriptionAggregate Subscription,
    Guid BuyerId,
    int CardTypeId,
    string CardNumber,
    string CardSecurityNumber,
    string CardHolderName,
    DateTime CardExpiration) : IDomainEvent;

