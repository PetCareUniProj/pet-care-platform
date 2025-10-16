namespace Ordering.Application.Orders.GetByUser;
public sealed record GetOrdersByUserQuery : PagedSortingOptions, IQuery<Result<OrdersResponse>>
{
    public required Guid UserId { get; init; }
}
