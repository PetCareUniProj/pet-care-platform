namespace Subscription.Application.Subscriptions.SetStockRejectedSubscriptionStatus;
public record SetStockRejectedSubscriptionStatusCommand : ICommand<Result>
{
    public required int SubscriptionId { get; init; }
    public required List<int> RejectedProductIds { get; init; }
}


