using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.SetStockConfirmedOrderStatus;

internal sealed class SetStockConfirmedOrderStatusCommandHandler
    (IApplicationDbContext dbContext)
    : ICommandHandler<SetStockConfirmedOrderStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetStockConfirmedOrderStatusCommand command, CancellationToken cancellationToken)
    {
        var orderToUpdate = await dbContext.Orders.FindAsync(new object?[] { command.OrderId }, cancellationToken: cancellationToken);
        if (orderToUpdate is null)
        {
            return Result.Failure(OrderingErrors.Order.NotFound(command.OrderId));
        }

        orderToUpdate.SetStockConfirmedStatus();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
