using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Ordering.Application.Orders.SetAwaitingValidationStatus;

namespace Ordering.Application.IntegrationalEvents.Handlers;

internal sealed class RecurringOrderReadyIntegrationEventHandler(IMediator mediator,
    ILogger<GracePeriodConfirmedIntegrationEventHandler> logger)
    : IIntegrationEventHandler<RecurringOrderReadyIntegrationEvent>
{
    public async Task Handle(RecurringOrderReadyIntegrationEvent @event)
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
