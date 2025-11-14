namespace Ordering.Application.IntegrationalEvents.Events;
public record OrderStatusChangedToAwaitingValidationIntegrationEvent : IntegrationEvent
{
    public int OrderId { get; init; }
    public required IEnumerable<OrderStockItem> OrderStockItems { get; init; }
}
