namespace Subscription.Application.IntegrationalEvents.Events;

public record SubscriptionPaymentFailedIntegrationEvent : IntegrationEvent
{
    public int SubscriptionId { get; init; }
}


