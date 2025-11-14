using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.SetAwaitingValidationStatus;
internal sealed class SetAwaitingValidationOrderStatusCommandHandler(IApplicationDbContext dbContext) : ICommandHandler<SetAwaitingValidationOrderStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetAwaitingValidationOrderStatusCommand command, CancellationToken cancellationToken)
    {
        var orderToUpdate = await dbContext.Orders.FindAsync(new object?[] { command.OrderId }, cancellationToken: cancellationToken);
        if (orderToUpdate is null)
        {
            return Result.Failure(OrderingErrors.Order.NotFound(command.OrderId));
        }

        orderToUpdate.SetAwaitingValidationStatus();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
