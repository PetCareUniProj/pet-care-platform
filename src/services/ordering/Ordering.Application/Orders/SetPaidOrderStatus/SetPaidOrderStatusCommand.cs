namespace Ordering.Application.Orders.SetPaidOrderStatus;
public record SetPaidOrderStatusCommand : ICommand<Result>
{
    public int OrderId { get; init; }
}
