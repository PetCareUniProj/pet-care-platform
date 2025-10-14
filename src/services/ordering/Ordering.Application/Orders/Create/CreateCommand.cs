namespace Ordering.Application.Orders.Create;
public sealed record CreateCommand : ICommand<Result>
{
    public required Guid BuyerId { get; init; }
    public required int DraftOrderId { get; init; }
    public string? City { get; init; }
    public string? Street { get; init; }
    public string? State { get; init; }
    public string? Country { get; init; }
    public string? ZipCode { get; init; }
    public string? CardNumber { get; init; }
    public string? CardHolderName { get; init; }
    public DateTime CardExpiration { get; init; }
    public string? CardSecurityNumber { get; init; }
    public int CardTypeId { get; init; }
    public int? PaymentMethodId { get; init; }
    public IEnumerable<OrderItemDTO> OrderItems { get; init; } = [];

}
