using System.Linq.Expressions;
using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Catalog.Domain.Errors;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Items.GetByIdOrSlug;

internal sealed class GetItemByIdOrSlugQueryHandler(IApplicationDbContext dbContext)
    : IQueryHandler<GetItemByIdOrSlugQuery, Result<ItemResponse>>
{
    private readonly IApplicationDbContext _dbContext = dbContext;

    public async ValueTask<Result<ItemResponse>> Handle(GetItemByIdOrSlugQuery query, CancellationToken cancellationToken)
    {
        if (query.IdOrSlug is null)
        {
            return Result.Failure<ItemResponse>(Error.NullValue);
        }

        Expression<Func<Item, ItemResponse>> itemProjection = item => new ItemResponse
        {
            Id = item.Id,
            Slug = item.Slug,
            Name = item.Name,
            Description = item.Description,
            Price = item.Price,
            PictureFileName = item.PictureFileName,
            CatalogBrandId = item.CatalogBrandId,
            AvailableStock = item.AvailableStock,
            RestockThreshold = item.RestockThreshold,
            MaxStockThreshold = item.MaxStockThreshold,
            OnReorder = item.OnReorder,
            CategoryIds = item.Categories.Select(c => c.Id)
        };

        var isNumeric = int.TryParse(query.IdOrSlug, out var itemId);

        var queryable = _dbContext.Items.AsQueryable().AsNoTracking();

        queryable = isNumeric ? queryable.Where(x => x.Id == itemId) : queryable.Where(x => x.Slug == query.IdOrSlug);

        var item = await queryable
            .Select(itemProjection)
            .SingleOrDefaultAsync(cancellationToken);

        if (item is null)
        {
            return isNumeric
                ? Result.Failure<ItemResponse>(ItemErrors.NotFound(itemId))
                : Result.Failure<ItemResponse>(ItemErrors.NotFoundBySlug(query.IdOrSlug));
        }

        return Result.Success(item);
    }
}