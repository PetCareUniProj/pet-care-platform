using Microsoft.EntityFrameworkCore;

namespace Subscription.Application.DomainEventHandlers;
internal sealed class ValidateBuyerWhenSubscriptionStartedDomainEventHandler
    (IApplicationDbContext dbContext, ISubscriptionIntegrationEventService SubscriptionIntegrationEventService)
    : IDomainEventHandler<SubscriptionStartedDomainEvent>
{
    public async Task Handle(SubscriptionStartedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var cardTypeId = domainEvent.CardTypeId != 0 ? domainEvent.CardTypeId : 1;
        var buyer = dbContext.Buyers
            .Include(b => b.PaymentMethods)
            .FirstOrDefault(b => b.Id == domainEvent.BuyerId);

        if (buyer is null)
        {
            return;
        }
        // REVIEW: The event this creates needs to be sent after SaveChanges has propagated the buyer Id. It currently only
        // works by coincidence. If we remove HiLo or if anything decides to yield earlier, it will break.
        buyer.VerifyOrAddPaymentMethod(
        cardTypeId,
        $"Payment Method on {DateTime.UtcNow}",
        domainEvent.CardNumber,
        domainEvent.CardSecurityNumber,
        domainEvent.CardHolderName,
        domainEvent.CardExpiration,
        domainEvent.Subscription.Id);

        await dbContext.SaveChangesAsync(cancellationToken);

        var integrationEvent = new SubscriptionStatusChangedToSubmittedIntegrationEvent(domainEvent.Subscription.Id, domainEvent.Subscription.SubscriptionStatus, buyer.Name, buyer.Email, buyer.Id);
        await SubscriptionIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}


