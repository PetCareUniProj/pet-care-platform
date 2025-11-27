namespace Subscription.Application.IntegrationalEvents.Events;
public record SubscriptionStatusChangedToAwaitingValidationIntegrationEvent : IntegrationEvent
{
    public int SubscriptionId { get; init; }
    public required IEnumerable<SubscriptionStockItem> SubscriptionStockItems { get; init; }
}


