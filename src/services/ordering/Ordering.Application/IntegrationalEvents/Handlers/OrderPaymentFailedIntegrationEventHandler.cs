using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Ordering.Application.Orders.Cancel;

namespace Ordering.Application.IntegrationalEvents.Handlers;

public class OrderPaymentFailedIntegrationEventHandler
    (IMediator mediator,
    ILogger<OrderPaymentFailedIntegrationEventHandler> logger) :
    IIntegrationEventHandler<OrderPaymentFailedIntegrationEvent>
{
    public async Task Handle(OrderPaymentFailedIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        var command = new CancelOrderCommand
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
