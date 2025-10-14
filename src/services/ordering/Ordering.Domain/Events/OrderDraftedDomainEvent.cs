namespace Ordering.Domain.Events;
public sealed record OrderDraftedDomainEvent(Order Order, Guid BuyerId, string BuyerName, string BuyerEmail) : IDomainEvent;