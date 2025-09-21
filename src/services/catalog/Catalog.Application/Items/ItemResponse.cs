namespace Catalog.Application.Items;
public class ItemResponse
{
    public int Id { get; init; }
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
    public IEnumerable<int> CategoryIds { get; init; } = [];
}