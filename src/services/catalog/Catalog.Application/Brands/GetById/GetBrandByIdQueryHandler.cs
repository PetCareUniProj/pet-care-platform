using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Brands.GetById;
internal sealed class GetBrandByIdQueryHandler : IQueryHandler<GetBrandByIdQuery, Result<BrandResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    public GetBrandByIdQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<BrandResponse>> Handle(GetBrandByIdQuery query, CancellationToken cancellationToken)
    {
        var response = await _dbContext.CatalogBrands.Where(x => x.Id == query.Id)
            .Select(x => new BrandResponse()
            {
                Id = x.Id,
                Name = x.Name
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (response == null)
        {
            return Result.Failure<BrandResponse>(BrandErrors.NotFound(query.Id));
        }

        return response;
    }
}
