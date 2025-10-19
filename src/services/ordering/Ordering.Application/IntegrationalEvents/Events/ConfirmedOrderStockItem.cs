namespace Ordering.Application.IntegrationalEvents.Events;
public record ConfirmedOrderStockItem(int ProductId, bool HasStock);

