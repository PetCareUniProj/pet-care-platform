using EventBus.Extensions;
using Microsoft.Extensions.Logging;
using Ordering.Application.Orders.SetStockRejectedOrderStatus;

namespace Ordering.Application.IntegrationalEvents.Handlers;

public class OrderStockRejectedIntegrationEventHandler
    (IMediator mediator,
    ILogger<OrderStockRejectedIntegrationEventHandler> logger) : IIntegrationEventHandler<OrderStockRejectedIntegrationEvent>
{
    public async Task Handle(OrderStockRejectedIntegrationEvent @event)
    {
        logger.LogInformation("Handling integration event: {IntegrationEventId} - ({@IntegrationEvent})", @event.Id, @event);

        var orderStockRejectedItems = @event.OrderStockItems
            .FindAll(c => !c.HasStock)
            .Select(c => c.ProductId)
            .ToList();

        var command = new SetStockRejectedOrderStatusCommand { OrderId = @event.OrderId, RejectedProductIds = orderStockRejectedItems };

        logger.LogInformation(
            "Sending command: {CommandName} - {IdProperty}: {CommandId} ({@Command})",
            command.GetGenericTypeName(),
            nameof(command.OrderId),
            command.OrderId,
            command);

        await mediator.Send(command);
    }
}