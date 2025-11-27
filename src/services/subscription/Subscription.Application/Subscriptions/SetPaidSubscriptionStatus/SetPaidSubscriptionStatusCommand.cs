namespace Subscription.Application.Subscriptions.SetPaidSubscriptionStatus;
public record SetPaidSubscriptionStatusCommand : ICommand<Result>
{
    public int SubscriptionId { get; init; }
}


