namespace Ordering.Application.Orders.GetAll;

public sealed record GetOrdersQuery : PagedSortingOptions, IQuery<Result<OrdersResponse>>
{
    public OrderStatus[]? Statuses { get; init; }
    public bool? IsRecurring { get; init; }
}

