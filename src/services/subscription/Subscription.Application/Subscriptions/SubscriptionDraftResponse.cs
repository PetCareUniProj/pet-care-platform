namespace Subscription.Application.Subscriptions;

public record SubscriptionDraftResponse
{
    public int Id { get; init; }
    public IEnumerable<SubscriptionItemDTO> SubscriptionItems { get; init; } = [];
    public decimal Total { get; init; }
    public bool IsRecurring { get; init; }
    public TimeSpan? RecurrenceInterval { get; init; }
    public static SubscriptionDraftResponse FromSubscription(SubscriptionAggregate subscription)
    {
        return new SubscriptionDraftResponse()
        {
            Id = subscription.Id,
            SubscriptionItems = subscription.SubscriptionItems.Select(oi => new SubscriptionItemDTO
            {
                Discount = oi.Discount,
                ProductId = oi.ProductId,
                UnitPrice = oi.UnitPrice,
                PictureUrl = oi.PictureUrl,
                Units = oi.Units,
                ProductName = oi.ProductName
            }),
            IsRecurring = subscription.IsRecurring,
            RecurrenceInterval = subscription.RecurrenceInterval,
            Total = subscription.GetTotal(),
        };
    }
}


