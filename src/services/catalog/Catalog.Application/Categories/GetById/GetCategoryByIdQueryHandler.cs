using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Errors;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Categories.GetById;
internal sealed class GetCategoryByIdQueryHandler : IQueryHandler<GetCategoryByIdQuery, Result<CategoryResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    public GetCategoryByIdQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<CategoryResponse>> Handle(GetCategoryByIdQuery query, CancellationToken cancellationToken)
    {
        var response = await _dbContext.Categories.Where(x => x.Id == query.Id)
            .Select(x => new CategoryResponse()
            {
                Id = x.Id,
                Name = x.Name
            })
            .AsNoTracking()
            .SingleOrDefaultAsync(cancellationToken);

        if (response == null)
        {
            return Result.Failure<CategoryResponse>(CategoryErrors.NotFound(query.Id));
        }

        return response;
    }
}