namespace Subscription.Domain.Events;
public sealed record RecurringSubscriptionCancelledDomainEvent(int SubscriptionId) : IDomainEvent;

