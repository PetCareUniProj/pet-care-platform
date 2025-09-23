using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Catalog.Domain.Errors;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Items.Create;

internal sealed class CreateItemCommandHandler : ICommandHandler<CreateItemCommand, Result<ItemResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public CreateItemCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<ItemResponse>> Handle(CreateItemCommand command, CancellationToken cancellationToken)
    {
        var slugExists = await _dbContext.Items
            .AnyAsync(i => i.Slug == command.Slug, cancellationToken);

        if (slugExists)
        {
            return Result.Failure<ItemResponse>(ItemErrors.DuplicateSlug(command.Slug));
        }

        var brand = await _dbContext.Brands
            .FirstOrDefaultAsync(b => b.Id == command.CatalogBrandId, cancellationToken);

        if (brand is null)
        {
            return Result.Failure<ItemResponse>(ItemErrors.InvalidBrand(command.CatalogBrandId));
        }

        var categories = await _dbContext.Categories
            .Where(c => command.CategoryIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        if (categories.Count != command.CategoryIds.Count)
        {
            // Find the first missing category id
            var missingId = command.CategoryIds.Except(categories.Select(c => c.Id)).First();
            return Result.Failure<ItemResponse>(ItemErrors.InvalidCategory(missingId));
        }

        var item = new Item
        {
            Slug = command.Slug,
            Name = command.Name,
            Description = command.Description,
            Price = command.Price,
            PictureFileName = command.PictureFileName,
            CatalogBrandId = command.CatalogBrandId,
            AvailableStock = command.AvailableStock,
            RestockThreshold = command.RestockThreshold,
            MaxStockThreshold = command.MaxStockThreshold,
            OnReorder = command.OnReorder,
            Categories = categories
        };

        _dbContext.Items.Add(item);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new ItemResponse
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

        return Result.Success(response);
    }
}