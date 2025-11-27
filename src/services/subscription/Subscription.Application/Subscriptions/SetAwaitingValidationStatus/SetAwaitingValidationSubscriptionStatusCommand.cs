namespace Subscription.Application.Subscriptions.SetAwaitingValidationStatus;
public record SetAwaitingValidationSubscriptionStatusCommand : ICommand<Result>
{
    public int SubscriptionId { get; init; }
}


