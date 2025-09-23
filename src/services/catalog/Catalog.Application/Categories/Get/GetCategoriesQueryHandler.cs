using Catalog.Application.Abstractions.Data;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Categories.Get;
internal sealed class GetCategoriesQueryHandler : IQueryHandler<GetCategoriesQuery, Result<CategoriesResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetCategoriesQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async ValueTask<Result<CategoriesResponse>> Handle(GetCategoriesQuery query, CancellationToken cancellationToken)
    {
        var categoriesQuery = _dbContext.Categories.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            categoriesQuery = categoriesQuery.Where(c => c.Name.Contains(query.Name));
        }

        if (!string.IsNullOrWhiteSpace(query.SortField))
        {
            var ascending = query.SortOrder is null || query.SortOrder == SortOrder.Ascending;
            categoriesQuery = query.SortField.ToLower() switch
            {
                "name" => ascending
                    ? categoriesQuery.OrderBy(c => c.Name)
                    : categoriesQuery.OrderByDescending(c => c.Name),
                _ => categoriesQuery.OrderBy(c => c.Id)
            };
        }
        else
        {
            categoriesQuery = categoriesQuery.OrderBy(c => c.Id);
        }

        var pageSize = query.PageSize > 0 ? query.PageSize : 20;
        var pageOffset = (query.Page > 0 ? query.Page - 1 : 0) * pageSize;

        var totalCount = await categoriesQuery.CountAsync(cancellationToken);

        var categories = await categoriesQuery
            .Skip(pageOffset)
            .Take(pageSize)
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync(cancellationToken);

        var response = new CategoriesResponse
        {
            Items = categories,
            Total = totalCount,
            Page = query.Page,
            PageSize = pageSize
        };
        return response;
    }
}