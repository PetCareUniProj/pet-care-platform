namespace Catalog.Application.IntegrationEvents.Events;

public record ConfirmedOrderStockItem(int ProductId, bool HasStock);
