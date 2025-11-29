namespace Ordering.Application.IntegrationalEvents.Events;

public sealed record OrderStartedIntegrationEvent(Guid BuyerId) : IntegrationEvent;