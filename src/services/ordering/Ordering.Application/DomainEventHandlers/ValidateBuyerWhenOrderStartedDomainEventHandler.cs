namespace Ordering.Application.DomainEventHandlers;
internal sealed class ValidateBuyerWhenOrderStartedDomainEventHandler
    (IApplicationDbContext dbContext, IOrderingIntegrationEventService orderingIntegrationEventService)
    : IDomainEventHandler<OrderStartedDomainEvent>
{
    public async Task Handle(OrderStartedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var cardTypeId = domainEvent.CardTypeId != 0 ? domainEvent.CardTypeId : 1;
        var buyer = dbContext.Buyers
            .FirstOrDefault(b => b.Id == domainEvent.BuyerId);

        if (buyer is null)
        {
            return;
        }

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
