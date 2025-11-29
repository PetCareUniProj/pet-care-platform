namespace Ordering.Application.Orders;

public record OrderResponse
{
    public int Id { get; init; }

    public DateTime OrderDate { get; init; }

    public required string OrderStatus { get; init; }

    public string? Description { get; init; }

    public Guid? BuyerId { get; init; }

    public required AddressDTO Address { get; init; }

    public IReadOnlyCollection<OrderItemDTO> OrderItems { get; init; } = [];

    public decimal Total { get; init; }

    public int? PaymentId { get; init; }

    public bool IsRecurring { get; init; }

    public TimeSpan? RecurrenceInterval { get; init; }

    public DateTime? NextRecurrenceDate { get; init; }

    public int? ParentOrderId { get; init; }

    public bool IsDraft { get; init; }
}

public record AddressDTO
{
    public required string Street { get; init; }

    public required string City { get; init; }

    public required string State { get; init; }

    public required string Country { get; init; }

    public required string ZipCode { get; init; }
}