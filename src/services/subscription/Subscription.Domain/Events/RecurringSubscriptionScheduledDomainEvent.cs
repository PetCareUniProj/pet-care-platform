namespace Subscription.Domain.Events;
public sealed record RecurringSubscriptionScheduledDomainEvent(int SubscriptionId, TimeSpan RecurrenceInterval, DateTime NextRecurrenceDate)
    : IDomainEvent;

