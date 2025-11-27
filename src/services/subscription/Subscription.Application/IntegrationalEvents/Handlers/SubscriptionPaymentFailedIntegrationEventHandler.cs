using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Subscription.Application.Subscriptions.Cancel;

namespace Subscription.Application.IntegrationalEvents.Handlers;

public class SubscriptionPaymentFailedIntegrationEventHandler
    (IMediator mediator,
    ILogger<SubscriptionPaymentFailedIntegrationEventHandler> logger) :
    IIntegrationEventHandler<SubscriptionPaymentFailedIntegrationEvent>
{
    public async Task Handle(SubscriptionPaymentFailedIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        var command = new CancelSubscriptionCommand
        {
            SubscriptionId = @event.SubscriptionId,
            IsApp = true
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


