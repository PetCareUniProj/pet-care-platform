namespace Subscription.Application.DomainEventHandlers;
internal sealed class SubscriptionCancelledDomainEventHandler
    (ISubscriptionIntegrationEventService SubscriptionIntegrationEventService) : IDomainEventHandler<SubscriptionCancelledDomainEvent>
{
    public Task Handle(SubscriptionCancelledDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        //TODO: Implement if needed
        return Task.CompletedTask;
    }
}


