namespace Ordering.Application.IntegrationalEvents.Events;

public record OrderPaymentFailedIntegrationEvent : IntegrationEvent
{
    public int OrderId { get; init; }
}
