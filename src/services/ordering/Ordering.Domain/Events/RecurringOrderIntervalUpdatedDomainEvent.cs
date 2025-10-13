using SharedKernel;

namespace Ordering.Domain.Events;

public sealed class RecurringOrderIntervalUpdatedDomainEvent : IDomainEvent
{
    public int OrderId { get; }
    public TimeSpan OldInterval { get; }
    public TimeSpan NewInterval { get; }

    public RecurringOrderIntervalUpdatedDomainEvent(int orderId, TimeSpan oldInterval, TimeSpan newInterval)
    {
        OrderId = orderId;
        OldInterval = oldInterval;
        NewInterval = newInterval;
    }
}