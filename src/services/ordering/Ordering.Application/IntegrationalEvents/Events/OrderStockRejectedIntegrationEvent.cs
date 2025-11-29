namespace Ordering.Application.IntegrationalEvents.Events;

public record OrderStockRejectedIntegrationEvent(int OrderId, List<ConfirmedOrderStockItem> OrderStockItems) : IntegrationEvent;

