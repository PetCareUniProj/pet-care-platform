namespace Ordering.Domain.Events;

public sealed record OrderShippedDomainEvent(Order Order) : IDomainEvent;