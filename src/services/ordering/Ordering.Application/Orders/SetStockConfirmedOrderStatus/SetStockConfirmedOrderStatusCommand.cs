namespace Ordering.Application.Orders.SetStockConfirmedOrderStatus;

public record SetStockConfirmedOrderStatusCommand : ICommand<Result>
{
    public required int OrderId { get; init; }
}
