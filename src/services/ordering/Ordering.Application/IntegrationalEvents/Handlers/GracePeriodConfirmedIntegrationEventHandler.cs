using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Ordering.Application.Orders.SetAwaitingValidationStatus;

namespace Ordering.Application.IntegrationalEvents.Handlers;

public sealed class GracePeriodConfirmedIntegrationEventHandler
    (IMediator mediator,
    ILogger<GracePeriodConfirmedIntegrationEventHandler> logger)
    : IIntegrationEventHandler<GracePeriodConfirmedIntegrationEvent>
{
    public async Task Handle(GracePeriodConfirmedIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);
        var command = new SetAwaitingValidationOrderStatusCommand
        {
            OrderId = @event.OrderId
        };

        logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            command.GetGenericTypeName(),
            nameof(command.OrderId),
            command.OrderId,
            command);

        await mediator.Send(command);
    }
}
