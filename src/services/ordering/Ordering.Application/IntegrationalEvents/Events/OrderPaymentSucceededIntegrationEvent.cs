namespace Ordering.Application.IntegrationalEvents.Events;

public record OrderPaymentSucceededIntegrationEvent : IntegrationEvent
{
    public int OrderId { get; init; }
}
