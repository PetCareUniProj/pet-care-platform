using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.SetAwaitingValidationStatus;
internal sealed class SetAwaitingValidationSubscriptionStatusCommandHandler(IApplicationDbContext dbContext) : ICommandHandler<SetAwaitingValidationSubscriptionStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetAwaitingValidationSubscriptionStatusCommand command, CancellationToken cancellationToken)
    {
        var SubscriptionToUpdate = await dbContext.Subscriptions.FindAsync(new object?[] { command.SubscriptionId }, cancellationToken: cancellationToken);
        if (SubscriptionToUpdate is null)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NotFound(command.SubscriptionId));
        }

        SubscriptionToUpdate.SetAwaitingValidationStatus();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}


