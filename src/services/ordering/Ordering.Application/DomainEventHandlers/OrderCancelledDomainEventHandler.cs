namespace Ordering.Application.DomainEventHandlers;

internal sealed class OrderCancelledDomainEventHandler
    (IOrderingIntegrationEventService orderingIntegrationEventService) : IDomainEventHandler<OrderCancelledDomainEvent>
{
    public Task Handle(OrderCancelledDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        //TODO: Implement if needed
        return Task.CompletedTask;
    }
}
