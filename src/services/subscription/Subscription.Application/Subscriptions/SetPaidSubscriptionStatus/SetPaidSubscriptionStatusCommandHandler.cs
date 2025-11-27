using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.SetPaidSubscriptionStatus;
internal sealed class SetPaidSubscriptionStatusCommandHandler
    (IApplicationDbContext dbContext)
    : ICommandHandler<SetPaidSubscriptionStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetPaidSubscriptionStatusCommand command, CancellationToken cancellationToken)
    {
        var SubscriptionToUpdate = await dbContext.Subscriptions.FindAsync([command.SubscriptionId], cancellationToken: cancellationToken);
        if (SubscriptionToUpdate is null)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NotFound(command.SubscriptionId));
        }

        SubscriptionToUpdate.SetPaidStatus();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}


