
namespace Catalog.Application.IntegrationEvents.Handlers;

public class OrderStatusChangedToAwaitingValidationIntegrationEventHandler(
    IApplicationDbContext catalogContext,
    ICatalogIntegrationEventService catalogIntegrationEventService,
    ILogger<OrderStatusChangedToAwaitingValidationIntegrationEventHandler> logger) :
    IIntegrationEventHandler<OrderStatusChangedToAwaitingValidationIntegrationEvent>
{
    public async Task Handle(OrderStatusChangedToAwaitingValidationIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        List<ConfirmedOrderStockItem> confirmedOrderStockItems = new();

        foreach (var orderStockItem in @event.OrderStockItems)
        {
            var catalogItem = await catalogContext.Items.FindAsync(orderStockItem.ProductId);
            if (catalogItem is null)
            {
                logger.LogWarning("Catalog item with id {CatalogItemId} not found in catalog for order {OrderId}", orderStockItem.ProductId, @event.OrderId);
                continue;
            }

            var hasStock = catalogItem.AvailableStock >= orderStockItem.Units;
            var confirmedOrderStockItem = new ConfirmedOrderStockItem(catalogItem.Id, hasStock);

            confirmedOrderStockItems.Add(confirmedOrderStockItem);
        }

        var confirmedIntegrationEvent = confirmedOrderStockItems.Any(c => !c.HasStock)
            ? (IntegrationEvent)new OrderStockRejectedIntegrationEvent(@event.OrderId, confirmedOrderStockItems)
            : new OrderStockConfirmedIntegrationEvent(@event.OrderId);

        await catalogIntegrationEventService.SaveEventAndCatalogContextChangesAsync(confirmedIntegrationEvent);
        await catalogIntegrationEventService.PublishThroughEventBusAsync(confirmedIntegrationEvent);
    }
}
