using Catalog.Application.Abstractions.Data;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Brands.Get;
internal class GetBrandsQueryHandler : IQueryHandler<GetBrandsQuery, Result<BrandsResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetBrandsQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async ValueTask<Result<BrandsResponse>> Handle(GetBrandsQuery query, CancellationToken cancellationToken)
    {
        var brandsQuery = _dbContext.Brands.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            brandsQuery = brandsQuery.Where(b => b.Name.Contains(query.Name));
        }

        if (!string.IsNullOrWhiteSpace(query.SortField))
        {
            var ascending = query.SortOrder is null || query.SortOrder == SortOrder.Ascending;
            brandsQuery = query.SortField.ToLower() switch
            {
                "name" => ascending
                    ? brandsQuery.OrderBy(b => b.Name)
                    : brandsQuery.OrderByDescending(b => b.Name),
                _ => brandsQuery.OrderBy(b => b.Id)
            };
        }
        else
        {
            brandsQuery = brandsQuery.OrderBy(b => b.Id);
        }

        var pageSize = query.PageSize > 0 ? query.PageSize : 20;
        var pageOffset = (query.Page > 0 ? query.Page - 1 : 0) * pageSize;

        var totalCount = await brandsQuery.CountAsync(cancellationToken);

        var brands = await brandsQuery
        .Skip(pageOffset)
        .Take(pageSize)
        .Select(b => new BrandResponse
        {
            Id = b.Id,
            Name = b.Name
        })
        .ToListAsync(cancellationToken);

        var response = new BrandsResponse
        {
            Items = brands,
            Total = totalCount,
            Page = query.Page,
            PageSize = pageSize
        };
        return response;
    }
}