using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.Cancel;

internal sealed class CancelSubscriptionCommandHandler
    (IApplicationDbContext dbContext)
    : ICommandHandler<CancelSubscriptionCommand, Result>
{
    public async ValueTask<Result> Handle(CancelSubscriptionCommand command, CancellationToken cancellationToken)
    {

        var Subscription = await dbContext.Subscriptions
            .FindAsync([command.SubscriptionId], cancellationToken);
        var isUserSubscription = Subscription?.BuyerId == command.Identity;

        if (!command.IsAdmin && !command.IsApp && !isUserSubscription)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NotFoundForUser);
        }

        if (Subscription is null)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NotFound(command.SubscriptionId));
        }

        Subscription.SetCancelledStatus();

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}


