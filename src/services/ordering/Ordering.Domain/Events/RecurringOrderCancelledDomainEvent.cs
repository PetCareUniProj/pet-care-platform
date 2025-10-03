using SharedKernel;

namespace Ordering.Domain.Events;
public sealed class RecurringOrderCancelledDomainEvent : IDomainEvent
{
    public int OrderId { get; }

    public RecurringOrderCancelledDomainEvent(int orderId)
    {
        OrderId = orderId;
    }
}