namespace Subscription.Application.IntegrationalEvents.Events;
public sealed record SubscriptionStartedIntegrationEvent(Guid BuyerId) : IntegrationEvent;

