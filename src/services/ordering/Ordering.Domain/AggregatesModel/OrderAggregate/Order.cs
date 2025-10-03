using Ordering.Domain.AggregatesModel.BuyerAggregate;
using Ordering.Domain.Errors;
using Ordering.Domain.Events;
using SharedKernel;

namespace Ordering.Domain.AggregatesModel.OrderAggregate;

public class Order : Entity, IAggregateRoot
{
    public int Id { get; private set; }
    public DateTime OrderDate { get; private set; }
    public Address Address { get; private set; }
    public int? BuyerId { get; private set; }
    public Buyer Buyer { get; }
    public OrderStatus OrderStatus { get; private set; }
    public string Description { get; private set; }

    public bool IsRecurring { get; private set; }
    public TimeSpan? RecurrenceInterval { get; private set; }
    public DateTime? NextRecurrenceDate { get; private set; }
    public int? ParentOrderId { get; private set; }

    private bool _isDraft;

    private readonly List<OrderItem> _orderItems = new();
    public IReadOnlyCollection<OrderItem> OrderItems => _orderItems.AsReadOnly();

    public int? PaymentId { get; private set; }

    public static Order NewDraft() => new() { _isDraft = true };

    protected Order() { }

    private Order(Address address, int? buyerId = null, int? paymentMethodId = null)
    {
        Address = address;
        BuyerId = buyerId;
        PaymentId = paymentMethodId;
        OrderStatus = OrderStatus.Submitted;
        OrderDate = DateTime.UtcNow;
    }

    public static Result<Order> Create(Address address, int? buyerId = null, int? paymentMethodId = null)
    {
        if (address is null)
        {
            return Result.Failure<Order>(OrderingErrors.Order.NullAddress);
        }

        return Result.Success(new Order(address, buyerId, paymentMethodId));
    }

    public static Result<Order> CreateRecurringOrder(Address address, int? buyerId, int? paymentMethodId, TimeSpan recurrenceInterval)
    {
        if (address is null)
        {
            return Result.Failure<Order>(OrderingErrors.Order.NullAddress);
        }

        if (recurrenceInterval <= TimeSpan.Zero)
        {
            return Result.Failure<Order>(OrderingErrors.Order.InvalidRecurrenceInterval);
        }

        // Create a new order
        var newOrder = new Order(address, buyerId, paymentMethodId)
        {
            IsRecurring = true,
            RecurrenceInterval = recurrenceInterval,
            NextRecurrenceDate = DateTime.UtcNow.Add(recurrenceInterval)
        };

        newOrder.Raise(new RecurringOrderCreatedDomainEvent(newOrder.Id, null, recurrenceInterval, newOrder.NextRecurrenceDate.Value));

        return Result.Success(newOrder);
    }

    public Result<Order> CreateRecurringOrderFromExisting(TimeSpan recurrenceInterval)
    {
        if (recurrenceInterval <= TimeSpan.Zero)
        {
            return Result.Failure<Order>(OrderingErrors.Order.InvalidRecurrenceInterval);
        }

        // Clone the current order
        var newOrder = new Order(Address, BuyerId, PaymentId)
        {
            ParentOrderId = Id,
            IsRecurring = true,
            RecurrenceInterval = recurrenceInterval,
            NextRecurrenceDate = DateTime.UtcNow.Add(recurrenceInterval)
        };

        // Copy order items
        foreach (var item in _orderItems)
        {
            var itemResult = newOrder.AddOrderItem(item.ProductId, item.ProductName, item.UnitPrice, item.Discount, item.PictureUrl, item.Units);
            if (itemResult.IsFailure)
            {
                return Result.Failure<Order>(itemResult.Error);
            }
        }

        // Raise domain event
        newOrder.Raise(new RecurringOrderCreatedDomainEvent(newOrder.Id, Id, recurrenceInterval, newOrder.NextRecurrenceDate.Value));

        return Result.Success(newOrder);
    }

    public Result AddOrderItem(int productId, string productName, decimal unitPrice, decimal discount, string pictureUrl, int units = 1)
    {
        var existingOrderForProduct = _orderItems.SingleOrDefault(o => o.ProductId == productId);

        if (existingOrderForProduct != null)
        {
            if (discount > existingOrderForProduct.Discount)
            {
                existingOrderForProduct.SetNewDiscount(discount);
            }

            return existingOrderForProduct.AddUnits(units);
        }
        else
        {
            var itemResult = OrderItem.Create(productId, productName, unitPrice, discount, pictureUrl, units);
            if (itemResult.IsFailure)
            {
                return Result.Failure(itemResult.Error);
            }

            _orderItems.Add(itemResult.Value);
            return Result.Success();
        }
    }

    public Result ScheduleRecurrence(TimeSpan? interval = null, DateTime? nextRecurrenceDate = null)
    {
        if (!IsRecurring)
        {
            return Result.Failure(OrderingErrors.Order.NotRecurringOrder);
        }

        if (interval is null && nextRecurrenceDate is null)
        {
            return Result.Failure(OrderingErrors.Order.InvalidRecurrenceUpdate);
        }

        if (interval is not null && interval <= TimeSpan.Zero)
        {
            return Result.Failure(OrderingErrors.Order.InvalidRecurrenceInterval);
        }

        if (nextRecurrenceDate is not null && nextRecurrenceDate <= DateTime.UtcNow)
        {
            return Result.Failure(OrderingErrors.Order.InvalidNextRecurrenceDate);
        }

        if (interval is not null)
        {
            var oldInterval = RecurrenceInterval;
            RecurrenceInterval = interval;

            // Recalculate next recurrence date if interval is updated
            NextRecurrenceDate = DateTime.UtcNow.Add(interval.Value);

            // Raise domain event for interval update
            Raise(new RecurringOrderIntervalUpdatedDomainEvent(Id, oldInterval ?? TimeSpan.Zero, interval.Value));
        }

        if (nextRecurrenceDate is not null && interval is null)
        {
            NextRecurrenceDate = nextRecurrenceDate.Value;

            Raise(new RecurringOrderScheduledDomainEvent(Id, RecurrenceInterval.Value, nextRecurrenceDate.Value));
        }

        return Result.Success();
    }

    public Result CancelRecurrence()
    {
        if (!IsRecurring)
        {
            return Result.Failure(OrderingErrors.Order.NotRecurringOrder);
        }

        IsRecurring = false;
        RecurrenceInterval = null;
        NextRecurrenceDate = null;

        Raise(new RecurringOrderCancelledDomainEvent(Id));
        return Result.Success();
    }

    public void SetPaymentMethodVerified(int buyerId, int paymentId)
    {
        BuyerId = buyerId;
        PaymentId = paymentId;
    }

    public void SetAwaitingValidationStatus()
    {
        if (OrderStatus == OrderStatus.Submitted)
        {
            Raise(new OrderStatusChangedToAwaitingValidationDomainEvent(Id, _orderItems));
            OrderStatus = OrderStatus.AwaitingValidation;
        }
    }

    public void SetStockConfirmedStatus()
    {
        if (OrderStatus == OrderStatus.AwaitingValidation)
        {
            Raise(new OrderStatusChangedToStockConfirmedDomainEvent(Id));
            OrderStatus = OrderStatus.StockConfirmed;
            Description = "All the items were confirmed with available stock.";
        }
    }

    public void SetPaidStatus()
    {
        if (OrderStatus == OrderStatus.StockConfirmed)
        {
            Raise(new OrderStatusChangedToPaidDomainEvent(Id, OrderItems));
            OrderStatus = OrderStatus.Paid;
            Description = "The payment was performed at a simulated \"American Bank checking bank account ending on XX35071\"";
        }
    }

    public Result SetShippedStatus()
    {
        if (OrderStatus != OrderStatus.Paid)
        {
            return Result.Failure(OrderingErrors.Order.InvalidStatusChange("Shipped", OrderStatus.ToString()));
        }

        OrderStatus = OrderStatus.Shipped;
        Description = "The order was shipped.";
        Raise(new OrderShippedDomainEvent(this));
        return Result.Success();
    }

    public Result SetCancelledStatus()
    {
        if (OrderStatus == OrderStatus.Paid || OrderStatus == OrderStatus.Shipped)
        {
            return Result.Failure(OrderingErrors.Order.InvalidStatusChange("Cancelled", OrderStatus.ToString()));
        }

        OrderStatus = OrderStatus.Cancelled;
        Description = "The order was cancelled.";
        Raise(new OrderCancelledDomainEvent(this));
        return Result.Success();
    }

    public void SetCancelledStatusWhenStockIsRejected(IEnumerable<int> orderStockRejectedItems)
    {
        if (OrderStatus == OrderStatus.AwaitingValidation)
        {
            OrderStatus = OrderStatus.Cancelled;

            var itemsStockRejectedProductNames = OrderItems
                .Where(c => orderStockRejectedItems.Contains(c.ProductId))
                .Select(c => c.ProductName);

            var itemsStockRejectedDescription = string.Join(", ", itemsStockRejectedProductNames);
            Description = $"The product items don't have stock: ({itemsStockRejectedDescription}).";
        }
    }

    public decimal GetTotal() => _orderItems.Sum(o => o.Units * o.UnitPrice);
}