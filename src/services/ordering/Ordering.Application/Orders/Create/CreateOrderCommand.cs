namespace Ordering.Application.Orders.Create;

public sealed record CreateOrderCommand : ICommand<Result<OrderResponse>>
{
    public required Guid BuyerId { get; init; }
    public int DraftOrderId { get; init; }
    public required string City { get; init; }
    public required string Street { get; init; }
    public required string State { get; init; }
    public required string Country { get; init; }
    public required string ZipCode { get; init; }
    public required string CardNumber { get; init; }
    public required string CardHolderName { get; init; }
    public DateTime CardExpiration { get; init; }
    public required string CardSecurityNumber { get; init; }
    public int CardTypeId { get; init; }
    public int PaymentMethodId { get; init; }
}
