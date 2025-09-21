using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Items.Update;

internal sealed class UpdateItemCommandHandler : ICommandHandler<UpdateItemCommand, Result<ItemResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public UpdateItemCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<ItemResponse>> Handle(UpdateItemCommand command, CancellationToken cancellationToken)
    {
        var item = await _dbContext.Items
            .Include(i => i.Categories)
            .FirstOrDefaultAsync(i => i.Id == command.Id, cancellationToken);

        if (item is null)
        {
            return Result.Failure<ItemResponse>(ItemErrors.NotFound(command.Id));
        }

        var slugExists = await _dbContext.Items
            .AnyAsync(i => i.Slug == command.Slug && i.Id != command.Id, cancellationToken);

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
            var missingId = command.CategoryIds.Except(categories.Select(c => c.Id)).First();
            return Result.Failure<ItemResponse>(ItemErrors.InvalidCategory(missingId));
        }

        item.Slug = command.Slug;
        item.Name = command.Name;
        item.Description = command.Description;
        item.Price = command.Price;
        item.PictureFileName = command.PictureFileName;
        item.CatalogBrandId = command.CatalogBrandId;
        item.AvailableStock = command.AvailableStock;
        item.RestockThreshold = command.RestockThreshold;
        item.MaxStockThreshold = command.MaxStockThreshold;
        item.OnReorder = command.OnReorder;

        item.Categories.Clear();
        foreach (var category in categories)
        {
            item.Categories.Add(category);
        }

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