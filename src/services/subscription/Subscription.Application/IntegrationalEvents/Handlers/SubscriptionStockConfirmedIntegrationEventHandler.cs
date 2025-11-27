using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Subscription.Application.Subscriptions.SetStockConfirmedSubscriptionStatus;

namespace Subscription.Application.IntegrationalEvents.Handlers;

public class SubscriptionStockConfirmedIntegrationEventHandler(
    IMediator mediator,
    ILogger<SubscriptionStockConfirmedIntegrationEventHandler> logger) :
    IIntegrationEventHandler<SubscriptionStockConfirmedIntegrationEvent>
{
    public async Task Handle(SubscriptionStockConfirmedIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);
        var command = new SetStockConfirmedSubscriptionStatusCommand { SubscriptionId = @event.SubscriptionId };
        logger.LogInformation(
        "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
        command.GetGenericTypeName(),
        nameof(command.SubscriptionId),
        command.SubscriptionId,
        command);
        await mediator.Send(command);
    }
}


