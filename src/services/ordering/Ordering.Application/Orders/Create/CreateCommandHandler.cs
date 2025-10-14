using Microsoft.EntityFrameworkCore;

namespace Ordering.Application.Orders.Create;
internal sealed class CreateCommandHandler(IApplicationDbContext dbContext, IOrderingIntegrationEventService orderingIntegrationEventService) : ICommandHandler<CreateCommand, Result>
{
    public async ValueTask<Result> Handle(CreateCommand command, CancellationToken cancellationToken)
    {
        var orderStartedIntegrationEvent = new OrderStartedIntegrationEvent(command.BuyerId);
        await orderingIntegrationEventService.AddAndSaveEventAsync(orderStartedIntegrationEvent);

        Address address;
        var addressResult = Address.Create(command.Street, command.City, command.State, command.Country, command.ZipCode);
        if (addressResult.IsFailure)
        {
            return Result.Failure(addressResult.Error);
        }

        address = addressResult.Value;

        // Check for existing draft order
        var draftOrder = await dbContext.Orders
            .FirstOrDefaultAsync(
                o => o.Id == command.DraftOrderId && o.OrderStatus == OrderStatus.Draft,
                cancellationToken);

        Result<Order> orderResult;

        if (draftOrder is not null)
        {
            // Update the draft order with creation info
            var updateResult = draftOrder.UpdateFromDraft(
                address,
                command.CardTypeId,
                command.CardNumber ?? string.Empty,
                command.CardSecurityNumber ?? string.Empty,
                command.CardHolderName ?? string.Empty,
                command.CardExpiration,
                command.BuyerId,
                command.PaymentMethodId);

            if (updateResult.IsFailure)
            {
                return Result.Failure(updateResult.Error);
            }

            orderResult = Result.Success(draftOrder);
        }
        else
        {
            // Create a new order if no draft exists
            orderResult = Order.Create(
                address,
                command.CardTypeId,
                command.CardNumber ?? string.Empty,
                command.CardSecurityNumber ?? string.Empty,
                command.CardHolderName ?? string.Empty,
                command.CardExpiration,
                command.BuyerId,
                command.PaymentMethodId);

            if (orderResult.IsFailure)
            {
                return Result.Failure(orderResult.Error);
            }

            await dbContext.Orders.AddAsync(orderResult.Value, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
