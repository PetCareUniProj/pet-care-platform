namespace Subscription.Application.IntegrationalEvents.Events;
public record SubscriptionStockRejectedIntegrationEvent(int SubscriptionId, List<ConfirmedSubscriptionStockItem> SubscriptionStockItems) : IntegrationEvent;



