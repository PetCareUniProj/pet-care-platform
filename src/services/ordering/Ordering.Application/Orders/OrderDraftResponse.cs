namespace Ordering.Application.Orders;

public record OrderDraftResponse
{
    public int Id { get; init; }
    public IEnumerable<OrderItemDTO> OrderItems { get; init; } = [];
    public decimal Total { get; init; }
    public bool IsRecurring { get; init; }
    public TimeSpan? RecurrenceInterval { get; init; }
    public static OrderDraftResponse FromOrder(Order order)
    {
        return new OrderDraftResponse()
        {
            Id = order.Id,
            OrderItems = order.OrderItems.Select(oi => new OrderItemDTO
            {
                Discount = oi.Discount,
                ProductId = oi.ProductId,
                UnitPrice = oi.UnitPrice,
                PictureUrl = oi.PictureUrl,
                Units = oi.Units,
                ProductName = oi.ProductName
            }),
            IsRecurring = order.IsRecurring,
            RecurrenceInterval = order.RecurrenceInterval,
            Total = order.GetTotal(),
        };
    }
}
