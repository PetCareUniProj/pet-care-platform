using EventBus.Events;

namespace SubscriptionProcessor.Events;

public sealed record GracePeriodConfirmedIntegrationEvent : IntegrationEvent
{
    public int OrderId { get; }

    public GracePeriodConfirmedIntegrationEvent(int orderId)
    {
        OrderId = orderId;
    }
}
