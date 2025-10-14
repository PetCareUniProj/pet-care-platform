using EventBus.Events;

namespace Basket.Api.IntegrationalEvents.Events;

public sealed record OrderStartedIntegrationEvent(Guid BuyerId) : IntegrationEvent;