using SubscriptionAggregate = Subscription.Domain.Subscriptions.Subscription;

namespace Subscription.Domain.Events;

public sealed record SubscriptionShippedDomainEvent(SubscriptionAggregate Subscription) : IDomainEvent;

