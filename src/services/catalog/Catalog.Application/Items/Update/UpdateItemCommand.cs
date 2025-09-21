namespace Catalog.Application.Items.Update;
public sealed class UpdateItemCommand : ICommand<Result<ItemResponse>>
{
    public required int Id { get; init; }

    public required string Slug { get; init; }

    public required string Name { get; init; }

    public string? Description { get; init; }

    public decimal Price { get; init; }

    public string? PictureFileName { get; init; }

    public int CatalogBrandId { get; init; }

    public int AvailableStock { get; init; }

    public int RestockThreshold { get; init; }

    public int MaxStockThreshold { get; init; }

    public bool OnReorder { get; init; }

    public required IReadOnlyCollection<int> CategoryIds { get; init; }
}