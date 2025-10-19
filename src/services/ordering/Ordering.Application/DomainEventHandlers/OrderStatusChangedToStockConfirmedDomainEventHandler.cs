namespace Ordering.Application.DomainEventHandlers;
internal sealed class OrderStatusChangedToStockConfirmedDomainEventHandler : IDomainEventHandler<OrderStatusChangedToStockConfirmedDomainEvent>
{
    public Task Handle(OrderStatusChangedToStockConfirmedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
