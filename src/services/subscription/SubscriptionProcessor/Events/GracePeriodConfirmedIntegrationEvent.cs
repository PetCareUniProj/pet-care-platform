using EventBus.Events;

namespace SubscriptionProcessor.Events;

public record GracePeriodConfirmedIntegrationEvent : IntegrationEvent
{
    public int SubscriptionId { get; }

    public GracePeriodConfirmedIntegrationEvent(int subscriptionId)
    {
        SubscriptionId = subscriptionId;
    }
}
