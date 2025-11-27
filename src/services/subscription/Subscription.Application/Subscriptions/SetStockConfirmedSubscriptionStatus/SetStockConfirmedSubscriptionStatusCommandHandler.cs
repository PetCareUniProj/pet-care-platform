using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.SetStockConfirmedSubscriptionStatus;
internal sealed class SetStockConfirmedSubscriptionStatusCommandHandler
    (IApplicationDbContext dbContext)
    : ICommandHandler<SetStockConfirmedSubscriptionStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetStockConfirmedSubscriptionStatusCommand command, CancellationToken cancellationToken)
    {
        var SubscriptionToUpdate = await dbContext.Subscriptions.FindAsync(new object?[] { command.SubscriptionId }, cancellationToken: cancellationToken);
        if (SubscriptionToUpdate is null)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NotFound(command.SubscriptionId));
        }

        SubscriptionToUpdate.SetStockConfirmedStatus();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}


