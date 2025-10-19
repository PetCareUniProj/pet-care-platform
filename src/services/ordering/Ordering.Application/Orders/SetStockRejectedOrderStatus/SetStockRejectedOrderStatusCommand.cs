namespace Ordering.Application.Orders.SetStockRejectedOrderStatus;
public record SetStockRejectedOrderStatusCommand : ICommand<Result>
{
    public required int OrderId { get; init; }
    public required List<int> RejectedProductIds { get; init; }
}
