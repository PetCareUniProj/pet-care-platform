using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.SetStockRejectedOrderStatus;
internal sealed class SetStockRejectedOrderStatusCommandHandler
    (IApplicationDbContext dbContext)
    : ICommandHandler<SetStockRejectedOrderStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetStockRejectedOrderStatusCommand command, CancellationToken cancellationToken)
    {
        var orderToUpdate = await dbContext.Orders.FindAsync([command.OrderId], cancellationToken: cancellationToken);
        if (orderToUpdate is null)
        {
            return Result.Failure(OrderingErrors.Order.NotFound(command.OrderId));
        }

        orderToUpdate.SetCancelledStatusWhenStockIsRejected(command.RejectedProductIds);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
