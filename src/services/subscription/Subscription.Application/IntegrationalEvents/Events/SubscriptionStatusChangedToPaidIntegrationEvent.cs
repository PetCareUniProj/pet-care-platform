namespace Subscription.Application.IntegrationalEvents.Events;
public record SubscriptionStatusChangedToPaidIntegrationEvent : IntegrationEvent
{
    public int SubscriptionId { get; init; }
    public SubscriptionStatus SubscriptionStatus { get; init; }
    public required string BuyerName { get; init; }
    public required string BuyerEmail { get; init; }
    public required Guid BuyerIdentityGuid { get; init; }
    public required IEnumerable<SubscriptionStockItem> SubscriptionStockItems { get; init; }
}


