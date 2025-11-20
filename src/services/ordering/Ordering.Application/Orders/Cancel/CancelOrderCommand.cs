
namespace Ordering.Application.Orders.Cancel;

public record CancelOrderCommand : ICommand<Result>
{
    public int OrderId { get; init; }
    public Guid Identity { get; init; }
    public bool IsAdmin { get; init; }
    public bool IsApp { get; internal set; }
}
