using Microsoft.EntityFrameworkCore;

namespace Ordering.Application.Buyers.GetCardTypes;

internal sealed class GetCardTypesQueryHandler(IApplicationDbContext dbContext) : IQueryHandler<GetCardTypesQuery, Result<List<CardTypeResponse>>>
{
    public async ValueTask<Result<List<CardTypeResponse>>> Handle(GetCardTypesQuery query, CancellationToken cancellationToken)
    {
        var cardTypes = await dbContext.CardTypes
            .AsNoTracking()
            .Select(ct => new CardTypeResponse { Id = ct.Id, Name = ct.Name }).ToListAsync(cancellationToken: cancellationToken);

        return Result.Success(cardTypes);
    }
}
