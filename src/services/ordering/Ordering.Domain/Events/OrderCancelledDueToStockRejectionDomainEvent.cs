namespace Ordering.Domain.Events;

public sealed record OrderCancelledDueToStockRejectionDomainEvent(int OrderId, IEnumerable<int> RejectedProductIds)
    : IDomainEvent;