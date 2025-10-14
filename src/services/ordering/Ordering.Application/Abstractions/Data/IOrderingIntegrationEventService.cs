using EventBus.Events;

namespace Ordering.Application.Abstractions.Data;
public interface IOrderingIntegrationEventService
{
    Task PublishEventsThroughEventBusAsync(Guid transactionId);
    Task AddAndSaveEventAsync(IntegrationEvent evt);
}
