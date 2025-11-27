namespace Subscription.Application.IntegrationalEvents.Events;
public record SubscriptionStockConfirmedIntegrationEvent(int SubscriptionId) : IntegrationEvent;


