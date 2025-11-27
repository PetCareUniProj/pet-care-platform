
namespace Subscription.Application.Subscriptions.GetById;
public sealed record GetSubscriptionByIdQuery : IQuery<Result<SubscriptionResponse>>
{
    public required int SubscriptionId { get; init; }
    public required Guid UserId { get; init; }
    public required bool IsAdmin { get; set; }
}


