using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Items.GetByIdOrSlug;

internal sealed class GetItemByIdOrSlugQueryHandler : IQueryHandler<GetItemByIdOrSlugQuery, Result<ItemResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetItemByIdOrSlugQueryHandler(IApplicationDbContext dbContext)
        => _dbContext = dbContext;

    public async ValueTask<Result<ItemResponse>> Handle(GetItemByIdOrSlugQuery query, CancellationToken cancellationToken)
    {
        if (query.IdOrSlug is null)
        {
            return Result.Failure<ItemResponse>(Error.NullValue);
        }
        //TODO: optimize query(refac)
        // Try to parse as int (Id)
        if (int.TryParse(query.IdOrSlug, out var itemId))
        {
            var itemById = await _dbContext.Items
                .Where(x => x.Id == itemId)
                .Select(x => new ItemResponse
                {
                    Id = x.Id,
                    Slug = x.Slug,
                    Name = x.Name,
                    Description = x.Description,
                    Price = x.Price,
                    PictureFileName = x.PictureFileName,
                    CatalogBrandId = x.CatalogBrandId,
                    AvailableStock = x.AvailableStock,
                    RestockThreshold = x.RestockThreshold,
                    MaxStockThreshold = x.MaxStockThreshold,
                    OnReorder = x.OnReorder,
                    CategoryIds = x.Categories.Select(c => c.Id)
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (itemById is null)
            {
                return Result.Failure<ItemResponse>(ItemErrors.NotFound(itemId));
            }

            return Result.Success(itemById);
        }
        else
        {
            // Otherwise, treat as slug
            var itemBySlug = await _dbContext.Items
                .Where(x => x.Slug == query.IdOrSlug)
                .Select(x => new ItemResponse
                {
                    Id = x.Id,
                    Slug = x.Slug,
                    Name = x.Name,
                    Description = x.Description,
                    Price = x.Price,
                    PictureFileName = x.PictureFileName,
                    CatalogBrandId = x.CatalogBrandId,
                    AvailableStock = x.AvailableStock,
                    RestockThreshold = x.RestockThreshold,
                    MaxStockThreshold = x.MaxStockThreshold,
                    OnReorder = x.OnReorder,
                    CategoryIds = x.Categories.Select(c => c.Id)
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (itemBySlug is null)
            {
                return Result.Failure<ItemResponse>(ItemErrors.NotFoundBySlug(query.IdOrSlug));
            }

            return Result.Success(itemBySlug);
        }
    }
}