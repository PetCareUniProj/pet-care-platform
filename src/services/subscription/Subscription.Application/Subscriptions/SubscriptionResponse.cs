namespace Subscription.Application.Subscriptions;
public record SubscriptionResponse
{
    public int Id { get; init; }

    public DateTime SubscriptionDate { get; init; }

    public required string SubscriptionStatus { get; init; }

    public string? Description { get; init; }

    public Guid? BuyerId { get; init; }

    public required AddressDTO Address { get; init; }

    public IReadOnlyCollection<SubscriptionItemDTO> SubscriptionItems { get; init; } = [];

    public decimal Total { get; init; }

    public int? PaymentId { get; init; }

    public bool IsRecurring { get; init; }

    public TimeSpan? RecurrenceInterval { get; init; }

    public DateTime? NextRecurrenceDate { get; init; }

    public int? ParentSubscriptionId { get; init; }

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

