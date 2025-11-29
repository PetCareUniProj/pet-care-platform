using Microsoft.Extensions.Logging;

namespace Ordering.Application.DomainEventHandlers;

internal sealed class UpdateOrderWhenBuyerAndPaymentMethodVerifiedDomainEventHandler
    (IApplicationDbContext dbContext,
    ILogger<UpdateOrderWhenBuyerAndPaymentMethodVerifiedDomainEventHandler> logger)
    : IDomainEventHandler<BuyerAndPaymentMethodVerifiedDomainEvent>
{
    public async Task Handle(BuyerAndPaymentMethodVerifiedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var orderToUpdate = await dbContext.Orders.FindAsync(new object?[] { domainEvent.OrderId }, cancellationToken: cancellationToken);
        orderToUpdate?.SetPaymentMethodVerified(domainEvent.Buyer.Id, domainEvent.Payment.Id);
    }
}
