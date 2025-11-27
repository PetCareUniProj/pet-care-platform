using EventBus.Events;

namespace SubscriptionProcessor.Events;

public sealed record RecurringOrderReadyEvent : IntegrationEvent
{
    public RecurringOrderReadyEvent(int orderId)
    {
        OrderId = orderId;
    }

    public int OrderId { get; }
}
