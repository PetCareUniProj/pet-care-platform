namespace Subscription.Domain.Events;

/// <summary>
/// Event used when the grace period Subscription is confirmed
/// </summary>
public sealed record SubscriptionStatusChangedToAwaitingValidationDomainEvent
    (int SubscriptionId, IEnumerable<SubscriptionItem> SubscriptionItems)
        : IDomainEvent;

