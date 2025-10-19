namespace Ordering.Application.Orders.Cancel;
public record CancelOrderCommand : ICommand<Result>
{
    public int OrderId { get; init; }
}
