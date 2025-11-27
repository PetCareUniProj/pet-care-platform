using Microsoft.Extensions.Logging;

namespace Subscription.Application.DomainEventHandlers;
internal sealed class UpdateSubscriptionWhenBuyerAndPaymentMethodVerifiedDomainEventHandler
    (IApplicationDbContext dbContext,
    ILogger<UpdateSubscriptionWhenBuyerAndPaymentMethodVerifiedDomainEventHandler> logger)
    : IDomainEventHandler<BuyerAndPaymentMethodVerifiedDomainEvent>
{
    public async Task Handle(BuyerAndPaymentMethodVerifiedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var SubscriptionToUpdate = await dbContext.Subscriptions.FindAsync(new object?[] { domainEvent.SubscriptionId }, cancellationToken: cancellationToken);
        SubscriptionToUpdate?.SetPaymentMethodVerified(domainEvent.Buyer.Id, domainEvent.Payment.Id);
    }
}


