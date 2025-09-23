using SharedKernel;

namespace Catalog.Domain.Errors;
public static class ItemErrors
{
    public static Error NotFound(int catalogItemId) => Error.NotFound(
        "CatalogItems.NotFound",
        $"The catalog item with Id = '{catalogItemId}' was not found.");

    public static Error NotFoundBySlug(string slug) => Error.NotFound(
        "CatalogItems.NotFoundBySlug",
        $"The catalog item with slug = '{slug}' was not found.");

    public static Error OutOfStock(int catalogItemId) => Error.Problem(
        "CatalogItems.OutOfStock",
        $"The catalog item with Id = '{catalogItemId}' is out of stock.");

    public static Error ExceedsMaxStock(int catalogItemId, int maxStock) => Error.Problem(
        "CatalogItems.ExceedsMaxStock",
        $"Adding stock would exceed the maximum allowed ({maxStock}) for catalog item with Id = '{catalogItemId}'.");

    public static Error DuplicateSlug(string slug) => Error.Conflict(
        "CatalogItems.DuplicateSlug",
        $"A catalog item with slug = '{slug}' already exists.");

    public static Error InvalidBrand(int brandId) => Error.Problem(
        "CatalogItems.InvalidBrand",
        $"The specified brand (Id = '{brandId}') is invalid or unavailable for this operation.");

    public static Error InvalidCategory(int categoryId) => Error.Problem(
        "CatalogItems.InvalidCategory",
        $"The specified category (Id = '{categoryId}') is invalid or unavailable for this operation.");

}