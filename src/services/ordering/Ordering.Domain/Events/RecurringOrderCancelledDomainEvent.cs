namespace Ordering.Domain.Events;

public sealed record RecurringOrderCancelledDomainEvent(int OrderId) : IDomainEvent;