namespace Subscription.Application.IntegrationalEvents.Events;

public record SubscriptionPaymentSucceededIntegrationEvent : IntegrationEvent
{
    public int SubscriptionId { get; init; }
}


