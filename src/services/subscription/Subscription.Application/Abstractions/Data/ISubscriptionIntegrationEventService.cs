using EventBus.Events;

namespace Subscription.Application.Abstractions.Data;
public interface ISubscriptionIntegrationEventService
{
    Task PublishEventsThroughEventBusAsync(Guid transactionId);
    Task AddAndSaveEventAsync(IntegrationEvent evt);
}

