namespace Ordering.Application.IntegrationalEvents.Events;
public record OrderStatusChangedToPaidIntegrationEvent : IntegrationEvent
{
    public int OrderId { get; init; }
    public OrderStatus OrderStatus { get; init; }
    public required string BuyerName { get; init; }
    public required string BuyerEmail { get; init; }
    public required Guid BuyerIdentityGuid { get; init; }
    public required IEnumerable<OrderStockItem> OrderStockItems { get; init; }
}
