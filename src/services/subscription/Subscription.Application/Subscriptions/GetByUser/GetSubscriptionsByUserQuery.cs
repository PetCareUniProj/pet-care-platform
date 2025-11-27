namespace Subscription.Application.Subscriptions.GetByUser;
public sealed record GetSubscriptionsByUserQuery : PagedSortingOptions, IQuery<Result<SubscriptionsResponse>>
{
    public required Guid UserId { get; init; }
}


