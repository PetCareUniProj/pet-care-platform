namespace Subscription.Application.Subscriptions.Create;
public sealed record CreateSubscriptionCommand : ICommand<Result<SubscriptionResponse>>
{
    public required Guid BuyerId { get; init; }
    public int DraftSubscriptionId { get; init; }
    public required string City { get; init; }
    public required string Street { get; init; }
    public required string State { get; init; }
    public required string Country { get; init; }
    public required string ZipCode { get; init; }
    public required string CardNumber { get; init; }
    public required string CardHolderName { get; init; }
    public DateTime CardExpiration { get; init; }
    public required string CardSecurityNumber { get; init; }
    public int CardTypeId { get; init; }
    public int PaymentMethodId { get; init; }
}


