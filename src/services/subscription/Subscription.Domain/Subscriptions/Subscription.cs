namespace Subscription.Domain.Subscriptions;

public class Subscription : Entity
{
    public int Id { get; private set; }
    public DateTime SubscriptionDate { get; private set; }
    public Address? Address { get; private set; }
    public Guid? BuyerId { get; private set; }
    public Buyer Buyer { get; }
    public SubscriptionStatus SubscriptionStatus { get; private set; }
    public string? Description { get; private set; }

    public bool IsRecurring { get; private set; }
    public TimeSpan? RecurrenceInterval { get; private set; }
    public DateTime? NextRecurrenceDate { get; private set; }
    public int? ParentSubscriptionId { get; private set; }

    public bool IsDraft => SubscriptionStatus == SubscriptionStatus.Draft;

    private readonly List<SubscriptionItem> _subscriptionItems = new();
    public IReadOnlyCollection<SubscriptionItem> SubscriptionItems => _subscriptionItems.AsReadOnly();

    public int? PaymentId { get; private set; }

    public static Result<Subscription> NewDraft(Guid buyerId, string buyerName, string buyerEmail)
    {
        if (buyerId == Guid.Empty)
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidBuyerId);
        }

        if (string.IsNullOrWhiteSpace(buyerName))
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidBuyerName);
        }

        if (string.IsNullOrWhiteSpace(buyerEmail))
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidBuyerEmail);
        }

        var subscription = new Subscription
        {
            BuyerId = buyerId,
            SubscriptionStatus = SubscriptionStatus.Draft
        };

        subscription.Raise(new SubscriptionDraftedDomainEvent(subscription, buyerId, buyerName, buyerEmail));
        return Result.Success(subscription);
    }

    public static Result<Subscription> CreateRecurringDraft(Guid buyerId, string buyerName, string buyerEmail, TimeSpan recurrenceInterval)
    {
        if (buyerId == Guid.Empty)
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidBuyerId);
        }

        if (string.IsNullOrWhiteSpace(buyerName))
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidBuyerName);
        }

        if (string.IsNullOrWhiteSpace(buyerEmail))
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidBuyerEmail);
        }

        if (recurrenceInterval <= TimeSpan.Zero)
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidRecurrenceInterval);
        }

        var subscription = new Subscription
        {
            BuyerId = buyerId,
            SubscriptionStatus = SubscriptionStatus.Draft,
            IsRecurring = true,
            RecurrenceInterval = recurrenceInterval,
            NextRecurrenceDate = DateTime.UtcNow.Add(recurrenceInterval)
        };

        subscription.Raise(new SubscriptionDraftedDomainEvent(subscription, buyerId, buyerName, buyerEmail));
        return Result.Success(subscription);
    }
    protected Subscription() { }

    private Subscription(Address address, int cardTypeId, string cardNumber, string cardSecurityNumber,
            string cardHolderName, DateTime cardExpiration, Guid buyerId, int? paymentMethodId = null)
    {
        Address = address;
        BuyerId = buyerId;
        PaymentId = paymentMethodId;
        SubscriptionStatus = SubscriptionStatus.Submitted;
        SubscriptionDate = DateTime.UtcNow;
        AddSubscriptionStartedDomainEvent(buyerId, cardTypeId, cardNumber,
                    cardSecurityNumber, cardHolderName, cardExpiration);

    }

    public static Result<Subscription> Create(Address address, int cardTypeId, string cardNumber, string cardSecurityNumber,
            string cardHolderName, DateTime cardExpiration, Guid buyerId, int? paymentMethodId = null)
    {
        if (address is null)
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.NullAddress);
        }

        return Result.Success(new Subscription(address, cardTypeId, cardNumber, cardSecurityNumber, cardHolderName,
            cardExpiration, buyerId, paymentMethodId));
    }

    public static Result<Subscription> CreateRecurringSubscription(
        Address address,
        Guid buyerId,
        int cardTypeId,
        string cardNumber,
        string cardSecurityNumber,
        string cardHolderName,
        DateTime cardExpiration,
        int? paymentMethodId,
        TimeSpan recurrenceInterval)
    {
        if (address is null)
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.NullAddress);
        }

        if (recurrenceInterval <= TimeSpan.Zero)
        {
            return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidRecurrenceInterval);
        }

        var newSubscription = new Subscription(
            address,
            cardTypeId,
            cardNumber,
            cardSecurityNumber,
            cardHolderName,
            cardExpiration,
            buyerId,
            paymentMethodId)
        {
            IsRecurring = true,
            RecurrenceInterval = recurrenceInterval,
            NextRecurrenceDate = DateTime.UtcNow.Add(recurrenceInterval)
        };

        newSubscription.Raise(new RecurringSubscriptionCreatedDomainEvent(
            newSubscription.Id,
            null,
            recurrenceInterval,
            newSubscription.NextRecurrenceDate.Value));

        return Result.Success(newSubscription);
    }

    //public Result<Subscription> CreateRecurringSubscriptionFromExisting(TimeSpan recurrenceInterval)
    //{
    //    if (recurrenceInterval <= TimeSpan.Zero)
    //    {
    //        return Result.Failure<Subscription>(SubscriptionErrors.Subscription.InvalidRecurrenceInterval);
    //    }

    //    // Clone the current Subscription
    //    var newSubscription = new Subscription(Address, BuyerId, PaymentId)
    //    {
    //        ParentSubscriptionId = Id,
    //        IsRecurring = true,
    //        RecurrenceInterval = recurrenceInterval,
    //        NextRecurrenceDate = DateTime.UtcNow.Add(recurrenceInterval)
    //    };

    //    // Copy Subscription items
    //    foreach (var item in _subscriptionItems)
    //    {
    //        var itemResult = newSubscription.AddSubscriptionItem(item.ProductId, item.ProductName, item.UnitPrice, item.Discount, item.PictureUrl, item.Units);
    //        if (itemResult.IsFailure)
    //        {
    //            return Result.Failure<Subscription>(itemResult.Error);
    //        }
    //    }

    //    // Raise domain event
    //    newSubscription.Raise(new RecurringSubscriptionCreatedDomainEvent(newSubscription.Id, Id, recurrenceInterval, newSubscription.NextRecurrenceDate.Value));

    //    return Result.Success(newSubscription);
    //}
    public Result UpdateFromDraft(
    Address address,
    int cardTypeId,
    string cardNumber,
    string cardSecurityNumber,
    string cardHolderName,
    DateTime cardExpiration,
    Guid buyerId,
    int? paymentMethodId = null)
    {
        if (!IsDraft)
        {
            return Result.Failure(SubscriptionErrors.Subscription.InvalidStatusChange(SubscriptionStatus.Submitted.ToString(), SubscriptionStatus.ToString()));
        }

        if (address is null)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NullAddress);
        }

        Address = address;
        BuyerId = buyerId;
        PaymentId = paymentMethodId;
        SubscriptionStatus = SubscriptionStatus.Submitted;
        SubscriptionDate = DateTime.UtcNow;

        AddSubscriptionStartedDomainEvent(buyerId, cardTypeId, cardNumber, cardSecurityNumber, cardHolderName, cardExpiration);
        SetAwaitingValidationStatus();
        return Result.Success();
    }
    public Result AddSubscriptionItem(int productId, string productName, decimal unitPrice, decimal discount, string pictureUrl, int units = 1)
    {
        var existingSubscriptionForProduct = _subscriptionItems.SingleOrDefault(o => o.ProductId == productId);

        if (existingSubscriptionForProduct != null)
        {
            if (discount > existingSubscriptionForProduct.Discount)
            {
                existingSubscriptionForProduct.SetNewDiscount(discount);
            }

            return existingSubscriptionForProduct.AddUnits(units);
        }
        else
        {
            var itemResult = SubscriptionItem.Create(productId, productName, unitPrice, discount, pictureUrl, units);
            if (itemResult.IsFailure)
            {
                return Result.Failure(itemResult.Error);
            }

            _subscriptionItems.Add(itemResult.Value);
            return Result.Success();
        }
    }

    public Result ScheduleRecurrence(TimeSpan? interval = null, DateTime? nextRecurrenceDate = null)
    {
        if (!IsRecurring)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NotRecurringSubscription);
        }

        if (interval is null && nextRecurrenceDate is null)
        {
            return Result.Failure(SubscriptionErrors.Subscription.InvalidRecurrenceUpdate);
        }

        if (interval is not null && interval <= TimeSpan.Zero)
        {
            return Result.Failure(SubscriptionErrors.Subscription.InvalidRecurrenceInterval);
        }

        if (nextRecurrenceDate is not null && nextRecurrenceDate <= DateTime.UtcNow)
        {
            return Result.Failure(SubscriptionErrors.Subscription.InvalidNextRecurrenceDate);
        }

        if (interval is not null)
        {
            var oldInterval = RecurrenceInterval;
            RecurrenceInterval = interval;

            // Recalculate next recurrence date if interval is updated
            NextRecurrenceDate = DateTime.UtcNow.Add(interval.Value);

            // Raise domain event for interval update
            Raise(new RecurringSubscriptionIntervalUpdatedDomainEvent(Id, oldInterval ?? TimeSpan.Zero, interval.Value));
        }

        if (nextRecurrenceDate is not null && interval is null)
        {
            NextRecurrenceDate = nextRecurrenceDate.Value;

            Raise(new RecurringSubscriptionScheduledDomainEvent(Id, RecurrenceInterval.Value, nextRecurrenceDate.Value));
        }

        return Result.Success();
    }

    public Result CancelRecurrence()
    {
        if (!IsRecurring)
        {
            return Result.Failure(SubscriptionErrors.Subscription.NotRecurringSubscription);
        }

        IsRecurring = false;
        RecurrenceInterval = null;
        NextRecurrenceDate = null;

        Raise(new RecurringSubscriptionCancelledDomainEvent(Id));
        return Result.Success();
    }

    public void SetPaymentMethodVerified(Guid buyerId, int paymentId)
    {
        BuyerId = buyerId;
        PaymentId = paymentId;
    }

    public void SetAwaitingValidationStatus()
    {
        if (SubscriptionStatus == SubscriptionStatus.Submitted)
        {
            Raise(new SubscriptionStatusChangedToAwaitingValidationDomainEvent(Id, _subscriptionItems));
            SubscriptionStatus = SubscriptionStatus.AwaitingValidation;
        }
    }

    public void SetStockConfirmedStatus()
    {
        if (SubscriptionStatus == SubscriptionStatus.AwaitingValidation)
        {
            Raise(new SubscriptionStatusChangedToStockConfirmedDomainEvent(Id));
            SubscriptionStatus = SubscriptionStatus.StockConfirmed;
            Description = "All the items were confirmed with available stock.";
        }
    }

    public void SetPaidStatus()
    {
        if (SubscriptionStatus == SubscriptionStatus.StockConfirmed)
        {
            Raise(new SubscriptionStatusChangedToPaidDomainEvent(Id, SubscriptionItems));
            SubscriptionStatus = SubscriptionStatus.Paid;
            Description = "The payment was performed at a simulated \"American Bank checking bank account ending on XX35071\"";
        }
    }

    public Result SetShippedStatus()
    {
        if (SubscriptionStatus != SubscriptionStatus.Paid)
        {
            return Result.Failure(SubscriptionErrors.Subscription.InvalidStatusChange("Shipped", SubscriptionStatus.ToString()));
        }

        SubscriptionStatus = SubscriptionStatus.Shipped;
        Description = "The Subscription was shipped.";
        Raise(new SubscriptionShippedDomainEvent(this));
        return Result.Success();
    }

    public Result SetCancelledStatus()
    {
        if (SubscriptionStatus == SubscriptionStatus.Paid || SubscriptionStatus == SubscriptionStatus.Shipped)
        {
            return Result.Failure(SubscriptionErrors.Subscription.InvalidStatusChange("Cancelled", SubscriptionStatus.ToString()));
        }

        SubscriptionStatus = SubscriptionStatus.Cancelled;
        CancelRecurrence();
        Description = "The Subscription was cancelled.";
        Raise(new SubscriptionCancelledDomainEvent(this));
        return Result.Success();
    }

    public void SetCancelledStatusWhenStockIsRejected(IEnumerable<int> subscriptionStockRejectedItems)
    {
        if (SubscriptionStatus == SubscriptionStatus.AwaitingValidation)
        {
            SubscriptionStatus = SubscriptionStatus.Cancelled;

            var itemsStockRejectedProductNames = SubscriptionItems
                .Where(c => subscriptionStockRejectedItems.Contains(c.ProductId))
                .Select(c => c.ProductName);

            var itemsStockRejectedDescription = string.Join(", ", itemsStockRejectedProductNames);
            Description = $"The product items don't have stock: ({itemsStockRejectedDescription}).";
        }
    }

    private void AddSubscriptionStartedDomainEvent(Guid buyerId, int cardTypeId, string cardNumber, string cardSecurityNumber, string cardHolderName, DateTime cardExpiration)
    {
        var subscriptionStartedDomainEvent = new SubscriptionStartedDomainEvent(this, buyerId, cardTypeId,
                                                            cardNumber, cardSecurityNumber,
                                                            cardHolderName, cardExpiration);
        this.Raise(subscriptionStartedDomainEvent);
    }

    public decimal GetTotal() => _subscriptionItems.Sum(o => o.Units * o.UnitPrice);
}

