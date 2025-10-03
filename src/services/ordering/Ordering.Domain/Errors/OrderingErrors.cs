using SharedKernel;

namespace Ordering.Domain.Errors;
public static class OrderingErrors
{
    public static class Address
    {
        public static readonly Error NullStreet =
            Error.Failure("Address.NullStreet", "Street must be provided.");
        public static readonly Error NullCity =
            Error.Failure("Address.NullCity", "City must be provided.");
        public static readonly Error NullState =
            Error.Failure("Address.NullState", "State must be provided.");
        public static readonly Error NullCountry =
            Error.Failure("Address.NullCountry", "Country must be provided.");
        public static readonly Error NullZipCode =
            Error.Failure("Address.NullZipCode", "ZipCode must be provided.");
    }
    public static class Buyer
    {
        public static readonly Error NullIdentity =
            Error.Failure("Buyer.NullIdentity", "IdentityGuid must be provided.");

        public static readonly Error NullName =
            Error.Failure("Buyer.NullName", "Name must be provided.");
    }

    public static class PaymentMethod
    {
        public static readonly Error NullCardNumber =
            Error.Failure("PaymentMethod.NullCardNumber", "Card number must be provided.");

        public static readonly Error NullSecurityNumber =
            Error.Failure("PaymentMethod.NullSecurityNumber", "Security number must be provided.");

        public static readonly Error NullCardHolderName =
            Error.Failure("PaymentMethod.NullCardHolderName", "Card holder name must be provided.");

        public static readonly Error Expired =
            Error.Failure("PaymentMethod.Expired", "The payment card is expired.");
    }

    public static class Order
    {
        public static readonly Error NullAddress =
            Error.Failure("Order.NullAddress", "Address must be provided.");

        public static Error InvalidStatusChange(string to, string from) =>
            Error.Failure("Order.InvalidStatusChange", $"Cannot change order status from {from} to {to}.");
    }

    public static class OrderItem
    {
        public static readonly Error InvalidUnits =
            Error.Failure("OrderItem.InvalidUnits", "The number of units must be greater than zero.");

        public static readonly Error DiscountTooHigh =
            Error.Failure("OrderItem.DiscountTooHigh", "The total of order item is lower than applied discount.");

        public static readonly Error InvalidDiscount =
            Error.Failure("OrderItem.InvalidDiscount", "Discount is not valid.");
    }
}