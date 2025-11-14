namespace Ordering.Application.IntegrationalEvents.Events;
public record OrderStatusChangedToStockConfirmedIntegrationEvent(int OrderId) : IntegrationEvent;
