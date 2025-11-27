using Microsoft.EntityFrameworkCore;

namespace Subscription.Application.DomainEventHandlers;
internal sealed class SubscriptionStatusChangedToPaidDomainEventHandler
    (IApplicationDbContext dbContext,
    ISubscriptionIntegrationEventService SubscriptionIntegrationEventService)
    : IDomainEventHandler<SubscriptionStatusChangedToPaidDomainEvent>
{
    public async Task Handle(SubscriptionStatusChangedToPaidDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var Subscription = await dbContext.Subscriptions.FindAsync([domainEvent.SubscriptionId], cancellationToken);
        var buyer = await dbContext.Buyers
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == Subscription.BuyerId.Value, cancellationToken);

        var SubscriptionStockList = domainEvent.SubscriptionItems
        .Select(SubscriptionItem => new SubscriptionStockItem(SubscriptionItem.ProductId, SubscriptionItem.Units));

        var integrationEvent = new SubscriptionStatusChangedToPaidIntegrationEvent
        {
            SubscriptionId = domainEvent.SubscriptionId,
            SubscriptionStatus = Subscription.SubscriptionStatus,
            BuyerName = buyer.Name,
            BuyerEmail = buyer.Email,
            BuyerIdentityGuid = buyer.Id,
            SubscriptionStockItems = SubscriptionStockList
        };

        await SubscriptionIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}


