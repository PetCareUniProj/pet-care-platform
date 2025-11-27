namespace Subscription.Domain.Events;
public sealed record RecurringSubscriptionCreatedDomainEvent
    (int NewSubscriptionId, int? ParentSubscriptionId, TimeSpan RecurrenceInterval, DateTime NextRecurrenceDate) : IDomainEvent;

