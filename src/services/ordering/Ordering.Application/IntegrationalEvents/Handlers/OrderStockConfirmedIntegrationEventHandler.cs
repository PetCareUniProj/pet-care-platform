using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Ordering.Application.Orders.SetStockConfirmedOrderStatus;

namespace Ordering.Application.IntegrationalEvents.Handlers;

public class OrderStockConfirmedIntegrationEventHandler(
    IMediator mediator,
    ILogger<OrderStockConfirmedIntegrationEventHandler> logger) :
    IIntegrationEventHandler<OrderStockConfirmedIntegrationEvent>
{
    public async Task Handle(OrderStockConfirmedIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);
        var command = new SetStockConfirmedOrderStatusCommand { OrderId = @event.OrderId };
        logger.LogInformation(
        "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
        command.GetGenericTypeName(),
        nameof(command.OrderId),
        command.OrderId,
        command);
        await mediator.Send(command);
    }
}
