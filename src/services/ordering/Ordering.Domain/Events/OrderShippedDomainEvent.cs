using Ordering.Domain.AggregatesModel.OrderAggregate;
using SharedKernel;

namespace Ordering.Domain.Events;

public class OrderShippedDomainEvent : IDomainEvent
{
    public Order Order { get; }

    public OrderShippedDomainEvent(Order order)
    {
        Order = order;
    }
}
