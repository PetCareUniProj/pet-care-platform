using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Subscription.Application.Subscriptions.SetStockRejectedSubscriptionStatus;

namespace Subscription.Application.IntegrationalEvents.Handlers;

public class SubscriptionStockRejectedIntegrationEventHandler
    (IMediator mediator,
    ILogger<SubscriptionStockRejectedIntegrationEventHandler> logger) : IIntegrationEventHandler<SubscriptionStockRejectedIntegrationEvent>
{
    public async Task Handle(SubscriptionStockRejectedIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        var SubscriptionStockRejectedItems = @event.SubscriptionStockItems
            .FindAll(c => !c.HasStock)
            .Select(c => c.ProductId)
            .ToList();

        var command = new SetStockRejectedSubscriptionStatusCommand { SubscriptionId = @event.SubscriptionId, RejectedProductIds = SubscriptionStockRejectedItems };

        logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            command.GetGenericTypeName(),
            nameof(command.SubscriptionId),
            command.SubscriptionId,
            command);

        await mediator.Send(command);
    }
}

