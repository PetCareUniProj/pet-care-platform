namespace Catalog.Domain.Entities;

public class Item
{
    public int Id { get; set; }

    public required string Slug { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? PictureFileName { get; set; }

    public int CatalogBrandId { get; set; }

    // Quantity in stock
    public int AvailableStock { get; set; }

    // Available stock at which we should reorder
    public int RestockThreshold { get; set; }

    // Maximum number of units that can be in-stock at any time (due to physicial/logistical constraints in warehouses)
    public int MaxStockThreshold { get; set; }

    /// <summary>
    /// True if item is on reorder
    /// </summary>
    public bool OnReorder { get; set; }

    #region Navigation Properties
    public Brand? CatalogBrand { get; set; }

    public ICollection<Category> Categories { get; set; } = [];
    #endregion
}