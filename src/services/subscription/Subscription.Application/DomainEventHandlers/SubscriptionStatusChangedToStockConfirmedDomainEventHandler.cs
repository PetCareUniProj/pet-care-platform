namespace Subscription.Application.DomainEventHandlers;
internal sealed class SubscriptionStatusChangedToStockConfirmedDomainEventHandler
    (ISubscriptionIntegrationEventService SubscriptionIntegrationEventService) : IDomainEventHandler<SubscriptionStatusChangedToStockConfirmedDomainEvent>
{
    public async Task Handle(SubscriptionStatusChangedToStockConfirmedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var integrationalEvent = new SubscriptionStatusChangedToStockConfirmedIntegrationEvent(domainEvent.SubscriptionId);
        await SubscriptionIntegrationEventService.AddAndSaveEventAsync(integrationalEvent);
    }
}


