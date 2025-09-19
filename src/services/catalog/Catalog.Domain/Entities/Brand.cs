namespace Catalog.Domain.Entities;

public class Brand
{
    public int Id { get; set; }
    public required string Name { get; set; }

    #region Navigation Properties

    public ICollection<Item> CatalogItems { get; set; } = [];

    #endregion
}