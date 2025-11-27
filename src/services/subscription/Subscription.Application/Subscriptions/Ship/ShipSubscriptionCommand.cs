namespace Subscription.Application.Subscriptions.Ship;

public sealed record ShipSubscriptionCommand : ICommand<Result>
{
    public int SubscriptionId { get; init; }
}


