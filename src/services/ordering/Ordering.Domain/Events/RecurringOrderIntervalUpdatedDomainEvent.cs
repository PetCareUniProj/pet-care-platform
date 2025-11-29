namespace Ordering.Domain.Events;

public sealed record RecurringOrderIntervalUpdatedDomainEvent(int OrderId, TimeSpan OldInterval, TimeSpan NewInterval)
    : IDomainEvent;