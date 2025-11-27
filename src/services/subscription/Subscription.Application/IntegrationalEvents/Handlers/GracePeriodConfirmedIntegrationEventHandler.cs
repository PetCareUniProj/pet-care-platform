using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Subscription.Application.Subscriptions.SetAwaitingValidationStatus;

namespace Subscription.Application.IntegrationalEvents.Handlers;
public sealed class GracePeriodConfirmedIntegrationEventHandler
    (IMediator mediator,
    ILogger<GracePeriodConfirmedIntegrationEventHandler> logger)
    : IIntegrationEventHandler<GracePeriodConfirmedIntegrationEvent>
{
    public async Task Handle(GracePeriodConfirmedIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);
        var command = new SetAwaitingValidationSubscriptionStatusCommand
        {
            SubscriptionId = @event.SubscriptionId
        };

        logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            command.GetGenericTypeName(),
            nameof(command.SubscriptionId),
            command.SubscriptionId,
            command);

        await mediator.Send(command);
    }
}


