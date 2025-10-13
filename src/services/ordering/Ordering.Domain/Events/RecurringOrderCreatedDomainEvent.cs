namespace Ordering.Domain.Events;
public sealed record RecurringOrderCreatedDomainEvent
    (int NewOrderId, int? ParentOrderId, TimeSpan RecurrenceInterval, DateTime NextRecurrenceDate) : IDomainEvent;