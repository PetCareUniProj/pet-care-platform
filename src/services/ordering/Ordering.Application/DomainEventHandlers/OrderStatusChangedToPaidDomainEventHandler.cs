using Microsoft.EntityFrameworkCore;

namespace Ordering.Application.DomainEventHandlers;

internal sealed class OrderStatusChangedToPaidDomainEventHandler
    (IApplicationDbContext dbContext,
    IOrderingIntegrationEventService orderingIntegrationEventService)
    : IDomainEventHandler<OrderStatusChangedToPaidDomainEvent>
{
    public async Task Handle(OrderStatusChangedToPaidDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders.FindAsync([domainEvent.OrderId], cancellationToken);
        var buyer = await dbContext.Buyers
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == order.BuyerId.Value, cancellationToken);

        var orderStockList = domainEvent.OrderItems
        .Select(orderItem => new OrderStockItem(orderItem.ProductId, orderItem.Units));

        var integrationEvent = new OrderStatusChangedToPaidIntegrationEvent
        {
            OrderId = domainEvent.OrderId,
            OrderStatus = order.OrderStatus,
            BuyerName = buyer.Name,
            BuyerEmail = buyer.Email,
            BuyerIdentityGuid = buyer.Id,
            OrderStockItems = orderStockList
        };

        await orderingIntegrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
