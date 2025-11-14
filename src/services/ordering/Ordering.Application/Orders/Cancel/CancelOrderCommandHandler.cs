using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.Cancel;
internal sealed class CancelOrderCommandHandler
    (IApplicationDbContext dbContext)
    : ICommandHandler<CancelOrderCommand, Result>
{
    public async ValueTask<Result> Handle(CancelOrderCommand command, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .FindAsync([command.OrderId], cancellationToken);

        if (order is null)
        {
            return Result.Failure(OrderingErrors.Order.NotFound(command.OrderId));
        }

        order.SetCancelledStatus();

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
