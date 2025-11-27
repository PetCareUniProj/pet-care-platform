using SubscriptionAggregate = Subscription.Domain.Subscriptions.Subscription;

namespace Subscription.Domain.Events;
public sealed record SubscriptionDraftedDomainEvent(SubscriptionAggregate Subscription, Guid BuyerId, string BuyerName, string BuyerEmail) : IDomainEvent;

