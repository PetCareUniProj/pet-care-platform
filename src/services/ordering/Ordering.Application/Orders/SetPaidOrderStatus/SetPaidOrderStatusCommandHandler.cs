using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.SetPaidOrderStatus;
internal sealed class SetPaidOrderStatusCommandHandler
    (IApplicationDbContext dbContext)
    : ICommandHandler<SetPaidOrderStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetPaidOrderStatusCommand command, CancellationToken cancellationToken)
    {
        var orderToUpdate = await dbContext.Orders.FindAsync([command.OrderId], cancellationToken: cancellationToken);
        if (orderToUpdate is null)
        {
            return Result.Failure(OrderingErrors.Order.NotFound(command.OrderId));
        }

        orderToUpdate.SetPaidStatus();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
