namespace Ordering.Domain.Events;

/// <summary>
/// Event used when an order is created
/// </summary>
public sealed record OrderStartedDomainEvent(
    Order Order,
    Guid BuyerId,
    int CardTypeId,
    string CardNumber,
    string CardSecurityNumber,
    string CardHolderName,
    DateTime CardExpiration) : IDomainEvent;