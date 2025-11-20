namespace Ordering.Application.Orders.Ship;

public sealed record ShipOrderCommand : ICommand<Result>
{
    public int OrderId { get; init; }
}
