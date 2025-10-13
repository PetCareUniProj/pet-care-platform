namespace Ordering.Domain.Events;

/// <summary>
/// Event used when the order is paid
/// </summary>
public sealed record OrderStatusChangedToPaidDomainEvent(int OrderId, IEnumerable<OrderItem> OrderItems)
    : IDomainEvent;