using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.SetStockRejectedSubscriptionStatus;
internal sealed class SetStockRejectedSubscriptionStatusCommandHandler
    (IApplicationDbContext dbContext)
    : ICommandHandler<SetStockRejectedSubscriptionStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetStockRejectedSubscriptionStatusCommand command, CancellationToken cancellationToken)
    {
        var SubscriptionToUpdate = await dbContext.Subscriptions.FindAsync([command.SubscriptionId], cancellationToken: cancellationToken);
        if (SubscriptionToUpdate is null)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NotFound(command.SubscriptionId));
        }

        SubscriptionToUpdate.SetCancelledStatusWhenStockIsRejected(command.RejectedProductIds);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}


