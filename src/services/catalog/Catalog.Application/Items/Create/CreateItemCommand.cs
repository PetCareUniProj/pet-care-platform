namespace Catalog.Application.Items.Create;
public sealed record CreateItemCommand : ICommand<Result<ItemResponse>>
{
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
