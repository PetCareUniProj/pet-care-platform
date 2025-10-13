namespace Ordering.Domain.Events;
public sealed record RecurringOrderScheduledDomainEvent(int OrderId, TimeSpan RecurrenceInterval, DateTime NextRecurrenceDate)
    : IDomainEvent;