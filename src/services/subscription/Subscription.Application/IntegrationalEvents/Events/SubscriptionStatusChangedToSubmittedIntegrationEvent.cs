namespace Subscription.Application.IntegrationalEvents.Events;
public sealed record SubscriptionStatusChangedToSubmittedIntegrationEvent
    (int SubscriptionId, SubscriptionStatus SubscriptionStatus, string BuyerName, string BuyerEmail, Guid BuyerId)
    : IntegrationEvent;

