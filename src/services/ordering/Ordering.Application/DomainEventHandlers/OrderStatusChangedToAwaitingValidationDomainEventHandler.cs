using Microsoft.EntityFrameworkCore;

namespace Ordering.Application.DomainEventHandlers;

internal sealed class OrderStatusChangedToAwaitingValidationDomainEventHandler
    (IApplicationDbContext dbContext, IOrderingIntegrationEventService orderingIntegrationEventService)
    : IDomainEventHandler<OrderStatusChangedToAwaitingValidationDomainEvent>
{
    public async Task Handle(OrderStatusChangedToAwaitingValidationDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .SingleOrDefaultAsync(o => o.Id == domainEvent.OrderId, cancellationToken: cancellationToken);

        var orderStockList = domainEvent.OrderItems
            .Select(orderItem => new OrderStockItem(orderItem.ProductId, orderItem.Units));

        var orderStatusChangedToAwaitingValidationIntegrationEvent =
            new OrderStatusChangedToAwaitingValidationIntegrationEvent
            {
                OrderId = domainEvent.OrderId,
                OrderStockItems = orderStockList
            };

        await orderingIntegrationEventService
            .AddAndSaveEventAsync(orderStatusChangedToAwaitingValidationIntegrationEvent);

    }
}
