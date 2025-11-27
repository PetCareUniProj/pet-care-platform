namespace Subscription.Domain.Events;

public sealed record RecurringSubscriptionIntervalUpdatedDomainEvent(int SubscriptionId, TimeSpan OldInterval, TimeSpan NewInterval) 
    : IDomainEvent;

