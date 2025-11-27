namespace Subscription.Application.Models;
public record BasketItem
{
    public int ProductId { get; init; }
    public required string ProductName { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal OldUnitPrice { get; init; }
    public int Quantity { get; init; }
    public required string PictureUrl { get; init; }
}


