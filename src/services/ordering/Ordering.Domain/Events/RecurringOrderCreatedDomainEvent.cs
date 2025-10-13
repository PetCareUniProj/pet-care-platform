using SharedKernel;

namespace Ordering.Domain.Events;
public sealed class RecurringOrderCreatedDomainEvent : IDomainEvent
{
    public int NewOrderId { get; }
    public int? ParentOrderId { get; }
    public TimeSpan RecurrenceInterval { get; }
    public DateTime NextRecurrenceDate { get; }

    public RecurringOrderCreatedDomainEvent(int newOrderId, int? parentOrderId, TimeSpan recurrenceInterval, DateTime nextRecurrenceDate)
    {
        NewOrderId = newOrderId;
        ParentOrderId = parentOrderId;
        RecurrenceInterval = recurrenceInterval;
        NextRecurrenceDate = nextRecurrenceDate;
    }
}