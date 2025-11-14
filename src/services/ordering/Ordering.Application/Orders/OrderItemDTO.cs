namespace Ordering.Application.Orders;

public record OrderItemDTO
{
    public int ProductId { get; init; }

    public required string ProductName { get; init; }

    public decimal UnitPrice { get; init; }

    public decimal Discount { get; init; }

    public int Units { get; init; }

    public required string PictureUrl { get; init; }
}
