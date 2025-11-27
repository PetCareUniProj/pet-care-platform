namespace Subscription.Application.IntegrationalEvents.Events;
public record GracePeriodConfirmedIntegrationEvent : IntegrationEvent
{
    public int SubscriptionId { get; }

    public GracePeriodConfirmedIntegrationEvent(int SubscriptionId) =>
        SubscriptionId = SubscriptionId;
}


