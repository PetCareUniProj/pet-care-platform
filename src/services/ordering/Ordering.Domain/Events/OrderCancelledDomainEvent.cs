namespace Ordering.Domain.Events;

public sealed record OrderCancelledDomainEvent(Order Order) : IDomainEvent;

