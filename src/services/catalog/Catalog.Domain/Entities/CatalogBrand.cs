namespace Catalog.Domain.Entities;

public class CatalogBrand
{
    public int Id { get; set; }
    public required string Name { get; set; }

    #region Navigation Properties

    public ICollection<CatalogItem> CatalogItems { get; set; } = [];

    #endregion
}
