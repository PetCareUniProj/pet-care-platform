using Subscription.Application.Models;

namespace Subscription.Application.Subscriptions.CreateDraft;

public sealed record CreateSubscriptionDraftCommand : ICommand<Result<SubscriptionDraftResponse>>
{
    public required Guid BuyerId { get; init; }
    public required string BuyerName { get; init; }
    public required string BuyerEmail { get; init; }

    public IEnumerable<BasketItem> Items { get; init; } = [];

    public bool IsRecurring { get; init; }
    public TimeSpan? RecurrenceInterval { get; init; }
}

