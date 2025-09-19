using SharedKernel;

namespace Catalog.Domain.Entities;
public static class ItemErrors
{
    public static Error NotFound(int catalogItemId) => Error.NotFound(
        "CatalogItems.NotFound",
        $"The catalog item with Id = '{catalogItemId}' was not found.");

    public static Error OutOfStock(int catalogItemId) => Error.Problem(
        "CatalogItems.OutOfStock",
        $"The catalog item with Id = '{catalogItemId}' is out of stock.");

    public static Error ExceedsMaxStock(int catalogItemId, int maxStock) => Error.Problem(
        "CatalogItems.ExceedsMaxStock",
        $"Adding stock would exceed the maximum allowed ({maxStock}) for catalog item with Id = '{catalogItemId}'.");

}