using SharedKernel;

namespace Ordering.Domain.Events;
public sealed class RecurringOrderScheduledDomainEvent : IDomainEvent
{
    public int OrderId { get; }
    public TimeSpan RecurrenceInterval { get; }
    public DateTime NextRecurrenceDate { get; }

    public RecurringOrderScheduledDomainEvent(int orderId, TimeSpan recurrenceInterval, DateTime nextRecurrenceDate)
    {
        OrderId = orderId;
        RecurrenceInterval = recurrenceInterval;
        NextRecurrenceDate = nextRecurrenceDate;
    }
}