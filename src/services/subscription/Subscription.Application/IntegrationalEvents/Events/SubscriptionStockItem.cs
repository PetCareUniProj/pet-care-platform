namespace Subscription.Application.IntegrationalEvents.Events;
public record SubscriptionStockItem
{
    public int ProductId { get; }
    public int Units { get; }

    public SubscriptionStockItem(int productId, int units)
    {
        ProductId = productId;
        Units = units;
    }
}


