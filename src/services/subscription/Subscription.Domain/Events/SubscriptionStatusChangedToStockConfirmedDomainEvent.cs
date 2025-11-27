namespace Subscription.Domain.Events;

/// <summary>
/// Event used when the Subscription stock items are confirmed
/// </summary>
public sealed record SubscriptionStatusChangedToStockConfirmedDomainEvent(int SubscriptionId)
    : IDomainEvent;

