using Microsoft.EntityFrameworkCore;

namespace Subscription.Application.DomainEventHandlers;
internal sealed class SubscriptionStatusChangedToAwaitingValidationDomainEventHandler
    (IApplicationDbContext dbContext, ISubscriptionIntegrationEventService SubscriptionIntegrationEventService)
    : IDomainEventHandler<SubscriptionStatusChangedToAwaitingValidationDomainEvent>
{
    public async Task Handle(SubscriptionStatusChangedToAwaitingValidationDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var Subscription = await dbContext.Subscriptions
            .AsNoTracking()
            .Include(o => o.SubscriptionItems)
            .SingleOrDefaultAsync(o => o.Id == domainEvent.SubscriptionId, cancellationToken: cancellationToken);

        var SubscriptionStockList = domainEvent.SubscriptionItems
            .Select(SubscriptionItem => new SubscriptionStockItem(SubscriptionItem.ProductId, SubscriptionItem.Units));

        var SubscriptionStatusChangedToAwaitingValidationIntegrationEvent =
            new SubscriptionStatusChangedToAwaitingValidationIntegrationEvent
            {
                SubscriptionId = domainEvent.SubscriptionId,
                SubscriptionStockItems = SubscriptionStockList
            };

        await SubscriptionIntegrationEventService
            .AddAndSaveEventAsync(SubscriptionStatusChangedToAwaitingValidationIntegrationEvent);

    }
}


