using Catalog.Application.Abstractions.Data;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Items.Get;

internal sealed class GetItemsQueryHandler : IQueryHandler<GetItemsQuery, Result<ItemsResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetItemsQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<ItemsResponse>> Handle(GetItemsQuery query, CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.Item> itemsQuery = _dbContext.Items
            .AsNoTracking()
            .Include(i => i.Categories);

        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            itemsQuery = itemsQuery.Where(i => i.Name.Contains(query.Name));
        }

        if (query.BrandId is not null)
        {
            itemsQuery = itemsQuery.Where(i => i.CatalogBrandId == query.BrandId);
        }

        if (query.CategoryId is not null)
        {
            itemsQuery = itemsQuery.Where(i => i.Categories.Any(c => c.Id == query.CategoryId));
        }

        if (!string.IsNullOrWhiteSpace(query.SortField))
        {
            var ascending = query.SortOrder is null || query.SortOrder == SortOrder.Ascending;
            itemsQuery = query.SortField.ToLower() switch
            {
                "name" => ascending
                    ? itemsQuery.OrderBy(i => i.Name)
                    : itemsQuery.OrderByDescending(i => i.Name),
                "price" => ascending
                    ? itemsQuery.OrderBy(i => i.Price)
                    : itemsQuery.OrderByDescending(i => i.Price),
                _ => itemsQuery.OrderBy(i => i.Id)
            };
        }
        else
        {
            itemsQuery = itemsQuery.OrderBy(i => i.Id);
        }

        var pageSize = query.PageSize > 0 ? query.PageSize : 20;
        var pageOffset = (query.Page > 0 ? query.Page - 1 : 0) * pageSize;

        var totalCount = await itemsQuery.CountAsync(cancellationToken);

        //TODO: display only those fields to which the user has access
        var items = await itemsQuery
            .Skip(pageOffset)
            .Take(pageSize)
            .Select(i => new ItemResponse
            {
                Id = i.Id,
                Slug = i.Slug,
                Name = i.Name,
                Description = i.Description,
                Price = i.Price,
                PictureFileName = i.PictureFileName,
                CatalogBrandId = i.CatalogBrandId,
                AvailableStock = i.AvailableStock,
                RestockThreshold = i.RestockThreshold,
                MaxStockThreshold = i.MaxStockThreshold,
                OnReorder = i.OnReorder,
                CategoryIds = i.Categories.Select(c => c.Id)
            })
            .ToListAsync(cancellationToken);

        var response = new ItemsResponse
        {
            Items = items,
            Total = totalCount,
            Page = query.Page,
            PageSize = pageSize
        };
        return Result.Success(response);
    }
}