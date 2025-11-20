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

        public static readonly Error NullEmail =
            Error.Problem("Buyer.NullEmail", "Email must be provided.");

        public static readonly Error AlreadyExists =
            Error.Problem("Buyer.AlreadyExists", "The buyer with the same IdentityGuid already exists.");

        public static readonly Error NotExists =
            Error.NotFound("Buyer.NotExists", "The buyer does not exist.");
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
        public static Error NotFound(int orderId) =>
            Error.NotFound("Order.NotFound", $"Order with id {orderId} was not found.");

        public static readonly Error NotFoundForUser =
            Error.NotFound("Order.NotFound", "No orders found for the specified user.");

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

        public static readonly Error InvalidBuyerId =
            Error.Problem("Order.InvalidBuyerId", "The buyer ID must not be empty.");

        public static readonly Error InvalidBuyerName =
            Error.Problem("Order.InvalidBuyerName", "The buyer name must not be null or whitespace.");

        public static readonly Error InvalidBuyerEmail =
            Error.Problem("Order.InvalidBuyerEmail", "The buyer email must not be null or whitespace.");

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