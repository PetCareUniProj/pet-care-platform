namespace Ordering.Application.IntegrationalEvents.Events;

public sealed record OrderStatusChangedToSubmittedIntegrationEvent
    (int OrderId, OrderStatus OrderStatus, string BuyerName, string BuyerEmail, Guid BuyerId)
    : IntegrationEvent;