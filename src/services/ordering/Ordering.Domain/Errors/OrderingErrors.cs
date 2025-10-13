namespace Ordering.Domain.Errors;
public static class OrderingErrors
{
    public static class Address
    {
        public static readonly Error NullStreet =
            Error.Problem("Address.NullStreet", "Street must be provided.");
        public static readonly Error NullCity =
            Error.Problem("Address.NullCity", "City must be provided.");
        public static readonly Error NullState =
            Error.Problem("Address.NullState", "State must be provided.");
        public static readonly Error NullCountry =
            Error.Problem("Address.NullCountry", "Country must be provided.");
        public static readonly Error NullZipCode =
            Error.Problem("Address.NullZipCode", "ZipCode must be provided.");
    }
    public static class Buyer
    {
        public static readonly Error NullIdentity =
            Error.Problem("Buyer.NullIdentity", "IdentityGuid must be provided.");

        public static readonly Error NullName =
            Error.Problem("Buyer.NullName", "Name must be provided.");
    }

    public static class PaymentMethod
    {
        public static readonly Error NullCardNumber =
            Error.Problem("PaymentMethod.NullCardNumber", "Card number must be provided.");

        public static readonly Error NullSecurityNumber =
            Error.Problem("PaymentMethod.NullSecurityNumber", "Security number must be provided.");

        public static readonly Error NullCardHolderName =
            Error.Problem("PaymentMethod.NullCardHolderName", "Card holder name must be provided.");

        public static readonly Error Expired =
            Error.Problem("PaymentMethod.Expired", "The payment card is expired.");
    }

    public static class Order
    {
        public static readonly Error NullAddress =
            Error.Problem("Order.NullAddress", "Address must be provided.");

        public static Error InvalidStatusChange(string to, string from) =>
            Error.Problem("Order.InvalidStatusChange", $"Cannot change order status from {from} to {to}.");

        public static readonly Error InvalidRecurrenceInterval =
            Error.Problem("Order.InvalidRecurrenceInterval", "The recurrence interval must be greater than zero.");

        public static readonly Error NotRecurringOrder =
            Error.Problem("Order.NotRecurringOrder", "The order is not marked as recurring.");

        public static readonly Error InvalidNextRecurrenceDate =
            Error.Problem("Order.InvalidNextRecurrenceDate", "The next recurrence date must be in the future.");

        public static readonly Error InvalidRecurrenceUpdate =
            Error.Problem("Order.InvalidRecurrenceUpdate", "At least one of the recurrence interval or next recurrence date must be provided.");
    }

    public static class OrderItem
    {
        public static readonly Error InvalidUnits =
            Error.Problem("OrderItem.InvalidUnits", "The number of units must be greater than zero.");

        public static readonly Error DiscountTooHigh =
            Error.Problem("OrderItem.DiscountTooHigh", "The total of order item is lower than applied discount.");

        public static readonly Error InvalidDiscount =
            Error.Problem("OrderItem.InvalidDiscount", "Discount is not valid.");
    }
}