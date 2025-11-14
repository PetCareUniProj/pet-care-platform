using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Ordering.Application.Orders.SetPaidOrderStatus;

namespace Ordering.Application.IntegrationalEvents.Handlers;
public class OrderPaymentSucceededIntegrationEventHandler
    (IMediator mediator,
    ILogger<OrderPaymentSucceededIntegrationEventHandler> logger) :
    IIntegrationEventHandler<OrderPaymentSucceededIntegrationEvent>
{
    public async Task Handle(OrderPaymentSucceededIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        var command = new SetPaidOrderStatusCommand
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
