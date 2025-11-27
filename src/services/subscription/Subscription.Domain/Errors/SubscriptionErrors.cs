namespace Subscription.Domain.Errors;

public static class SubscriptionErrors
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

    public static class Subscription
    {
        public static Error NotFound(int SubscriptionId) =>
            Error.NotFound("Subscription.NotFound", $"Subscription with id {SubscriptionId} was not found.");

        public static readonly Error NotFoundForUser =
            Error.NotFound("Subscription.NotFound", "No Subscriptions found for the specified user.");

        public static readonly Error NullAddress =
            Error.Problem("Subscription.NullAddress", "Address must be provided.");

        public static Error InvalidStatusChange(string to, string from) =>
            Error.Problem("Subscription.InvalidStatusChange", $"Cannot change Subscription status from {from} to {to}.");

        public static readonly Error InvalidRecurrenceInterval =
            Error.Problem("Subscription.InvalidRecurrenceInterval", "The recurrence interval must be greater than zero.");

        public static readonly Error NotRecurringSubscription =
            Error.Problem("Subscription.NotRecurringSubscription", "The Subscription is not marked as recurring.");

        public static readonly Error InvalidNextRecurrenceDate =
            Error.Problem("Subscription.InvalidNextRecurrenceDate", "The next recurrence date must be in the future.");

        public static readonly Error InvalidRecurrenceUpdate =
            Error.Problem("Subscription.InvalidRecurrenceUpdate", "At least one of the recurrence interval or next recurrence date must be provided.");

        public static readonly Error InvalidBuyerId =
            Error.Problem("Subscription.InvalidBuyerId", "The buyer ID must not be empty.");

        public static readonly Error InvalidBuyerName =
            Error.Problem("Subscription.InvalidBuyerName", "The buyer name must not be null or whitespace.");

        public static readonly Error InvalidBuyerEmail =
            Error.Problem("Subscription.InvalidBuyerEmail", "The buyer email must not be null or whitespace.");

    }

    public static class SubscriptionItem
    {
        public static readonly Error InvalidUnits =
            Error.Problem("SubscriptionItem.InvalidUnits", "The number of units must be greater than zero.");

        public static readonly Error DiscountTooHigh =
            Error.Problem("SubscriptionItem.DiscountTooHigh", "The total of Subscription item is lower than applied discount.");

        public static readonly Error InvalidDiscount =
            Error.Problem("SubscriptionItem.InvalidDiscount", "Discount is not valid.");
    }
}

