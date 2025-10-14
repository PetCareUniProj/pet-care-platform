namespace Ordering.Application.Buyers.GetCardTypes;

public sealed record CardTypeResponse
{
    public required int Id { get; init; }
    public required string Name { get; init; }
}