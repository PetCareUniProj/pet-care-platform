namespace Subscription.Domain.Events;

public sealed record SubscriptionCancelledDueToStockRejectionDomainEvent(int SubscriptionId, IEnumerable<int> RejectedProductIds)
    : IDomainEvent;

