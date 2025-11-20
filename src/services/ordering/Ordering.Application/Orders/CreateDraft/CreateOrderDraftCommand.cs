using Ordering.Application.Models;

namespace Ordering.Application.Orders.CreateDraft;

public sealed record CreateOrderDraftCommand : ICommand<Result<OrderDraftResponse>>
{
    public required Guid BuyerId { get; init; }
    public required string BuyerName { get; init; }
    public required string BuyerEmail { get; init; }

    public IEnumerable<BasketItem> Items { get; init; } = [];

    public bool IsRecurring { get; init; }
    public TimeSpan? RecurrenceInterval { get; init; }
}