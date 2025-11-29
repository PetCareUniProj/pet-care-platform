namespace Ordering.Application.DomainEventHandlers;

internal sealed class OrderStatusChangedToStockConfirmedDomainEventHandler
    (IOrderingIntegrationEventService orderingIntegrationEventService) : IDomainEventHandler<OrderStatusChangedToStockConfirmedDomainEvent>
{
    public async Task Handle(OrderStatusChangedToStockConfirmedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var integrationalEvent = new OrderStatusChangedToStockConfirmedIntegrationEvent(domainEvent.OrderId);
        await orderingIntegrationEventService.AddAndSaveEventAsync(integrationalEvent);
    }
}
