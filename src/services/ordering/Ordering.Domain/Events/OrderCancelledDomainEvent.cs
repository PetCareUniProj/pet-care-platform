using Ordering.Domain.AggregatesModel.OrderAggregate;
using SharedKernel;

namespace Ordering.Domain.Events;

public class OrderCancelledDomainEvent : IDomainEvent
{
    public Order Order { get; }

    public OrderCancelledDomainEvent(Order order)
    {
        Order = order;
    }
}

