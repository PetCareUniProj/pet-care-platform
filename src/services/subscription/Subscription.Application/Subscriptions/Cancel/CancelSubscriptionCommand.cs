
namespace Subscription.Application.Subscriptions.Cancel;

public record CancelSubscriptionCommand : ICommand<Result>
{
    public int SubscriptionId { get; init; }
    public Guid Identity { get; init; }
    public bool IsAdmin { get; init; }
    public bool IsApp { get; internal set; }
}


