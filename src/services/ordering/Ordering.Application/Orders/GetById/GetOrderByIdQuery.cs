
namespace Ordering.Application.Orders.GetById;

public sealed record GetOrderByIdQuery : IQuery<Result<OrderResponse>>
{
    public required int OrderId { get; init; }
    public required Guid UserId { get; init; }
    public required bool IsAdmin { get; set; }
}
