namespace Ordering.Application.IntegrationalEvents.Events;

public sealed record RecurringOrderReadyIntegrationEvent : IntegrationEvent
{
    public RecurringOrderReadyIntegrationEvent(int orderId)
    {
        OrderId = orderId;
    }

    public int OrderId { get; }
}
