namespace Subscription.Domain.Events;

/// <summary>
/// Event used when the Subscription is paid
/// </summary>
public sealed record SubscriptionStatusChangedToPaidDomainEvent(int SubscriptionId, IEnumerable<SubscriptionItem> SubscriptionItems)
    : IDomainEvent;

