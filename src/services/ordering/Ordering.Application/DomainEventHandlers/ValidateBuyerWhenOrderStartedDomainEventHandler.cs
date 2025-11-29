using Microsoft.EntityFrameworkCore;

namespace Ordering.Application.DomainEventHandlers;

internal sealed class ValidateBuyerWhenOrderStartedDomainEventHandler
    (IApplicationDbContext dbContext, IOrderingIntegrationEventService orderingIntegrationEventService)
    : IDomainEventHandler<OrderStartedDomainEvent>
{
    public async Task Handle(OrderStartedDomainEvent domainEvent, CancellationToken cancellationToken)
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
        domainEvent.Order.Id);

        await dbContext.SaveChangesAsync(cancellationToken);

        var integrationEvent = new OrderStatusChangedToSubmittedIntegrationEvent(domainEvent.Order.Id, domainEvent.Order.OrderStatus, buyer.Name, buyer.Email, buyer.Id);
        await orderingIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
