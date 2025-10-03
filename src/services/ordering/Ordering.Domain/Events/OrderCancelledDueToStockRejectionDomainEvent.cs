using SharedKernel;

namespace Ordering.Domain.Events;

public sealed class OrderCancelledDueToStockRejectionDomainEvent : IDomainEvent
{
    public int OrderId { get; }
    public IEnumerable<int> RejectedProductIds { get; }

    public OrderCancelledDueToStockRejectionDomainEvent(int orderId, IEnumerable<int> rejectedProductIds)
    {
        OrderId = orderId;
        RejectedProductIds = rejectedProductIds;
    }
}