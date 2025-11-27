using Microsoft.EntityFrameworkCore;
using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.Ship;

internal class ShipSubscriptionCommandHandler(IApplicationDbContext dbContext) : ICommandHandler<ShipSubscriptionCommand, Result>
{
    public async ValueTask<Result> Handle(ShipSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var Subscription = await dbContext.Subscriptions
            .AsSplitQuery()
            .Include(o => o.SubscriptionItems)
            .Include(o => o.Address)
            .Where(o => o.Id == command.SubscriptionId)
            .SingleOrDefaultAsync(cancellationToken: cancellationToken);

        if (Subscription is null)
        {
            return Result.Failure<SubscriptionResponse>(SubscriptionErrors.Subscription.NotFound(command.SubscriptionId));
        }

        Subscription.SetShippedStatus();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}


