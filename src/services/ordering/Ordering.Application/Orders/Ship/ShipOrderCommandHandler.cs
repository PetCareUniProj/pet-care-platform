using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.Ship;

internal class ShipOrderCommandHandler(IApplicationDbContext dbContext) : ICommandHandler<ShipOrderCommand, Result>
{
    public async ValueTask<Result> Handle(ShipOrderCommand command, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .AsSplitQuery()
            .Include(o => o.OrderItems)
            .Include(o => o.Address)
            .Where(o => o.Id == command.OrderId)
            .SingleOrDefaultAsync(cancellationToken: cancellationToken);

        if (order is null)
        {
            return Result.Failure<OrderResponse>(OrderingErrors.Order.NotFound(command.OrderId));
        }

        order.SetShippedStatus();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
