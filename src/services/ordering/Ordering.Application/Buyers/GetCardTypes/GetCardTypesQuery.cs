namespace Ordering.Application.Buyers.GetCardTypes;

public sealed record GetCardTypesQuery : IQuery<Result<List<CardTypeResponse>>>;
