namespace Subscription.Application.Buyers.Create;
public sealed record CreateBuyerCommand : ICommand<Result>
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
}

