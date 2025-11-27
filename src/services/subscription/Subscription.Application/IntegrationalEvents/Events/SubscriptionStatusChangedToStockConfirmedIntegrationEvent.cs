namespace Subscription.Application.IntegrationalEvents.Events;
public record SubscriptionStatusChangedToStockConfirmedIntegrationEvent(int SubscriptionId) : IntegrationEvent;


