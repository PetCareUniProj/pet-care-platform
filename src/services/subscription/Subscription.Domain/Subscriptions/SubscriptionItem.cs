namespace Subscription.Domain.Subscriptions;

public class SubscriptionItem : Entity
{
    public string ProductName { get; private set; }
    public string PictureUrl { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal Discount { get; private set; }
    public int Units { get; private set; }
    public int ProductId { get; private set; }
    public int Id { get; private set; }

    protected SubscriptionItem() { }

    private SubscriptionItem(int productId, string productName, decimal unitPrice, decimal discount, string pictureUrl, int units)
    {
        ProductId = productId;
        ProductName = productName;
        UnitPrice = unitPrice;
        Discount = discount;
        Units = units;
        PictureUrl = pictureUrl;
    }

    public static Result<SubscriptionItem> Create(int productId, string productName, decimal unitPrice, decimal discount, string pictureUrl, int units = 1)
    {
        if (units <= 0)
        {
            return Result.Failure<SubscriptionItem>(SubscriptionErrors.SubscriptionItem.InvalidUnits);
        }

        if (unitPrice * units < discount)
        {
            return Result.Failure<SubscriptionItem>(SubscriptionErrors.SubscriptionItem.DiscountTooHigh);
        }

        return Result.Success(new SubscriptionItem(productId, productName, unitPrice, discount, pictureUrl, units));
    }

    public Result SetNewDiscount(decimal discount)
    {
        if (discount < 0)
        {
            return Result.Failure(SubscriptionErrors.SubscriptionItem.InvalidDiscount);
        }

        Discount = discount;
        return Result.Success();
    }

    public Result AddUnits(int units)
    {
        if (units < 0)
        {
            return Result.Failure(SubscriptionErrors.SubscriptionItem.InvalidUnits);
        }

        Units += units;
        return Result.Success();
    }
}

