namespace Subscription.Application.Subscriptions.SetStockConfirmedSubscriptionStatus;
public record SetStockConfirmedSubscriptionStatusCommand : ICommand<Result>
{
    public required int SubscriptionId { get; init; }
}


