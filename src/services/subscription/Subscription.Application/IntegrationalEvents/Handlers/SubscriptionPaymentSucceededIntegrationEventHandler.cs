using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Subscription.Application.Subscriptions.SetPaidSubscriptionStatus;

namespace Subscription.Application.IntegrationalEvents.Handlers;
public class SubscriptionPaymentSucceededIntegrationEventHandler
    (IMediator mediator,
    ILogger<SubscriptionPaymentSucceededIntegrationEventHandler> logger) :
    IIntegrationEventHandler<SubscriptionPaymentSucceededIntegrationEvent>
{
    public async Task Handle(SubscriptionPaymentSucceededIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        var command = new SetPaidSubscriptionStatusCommand
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


