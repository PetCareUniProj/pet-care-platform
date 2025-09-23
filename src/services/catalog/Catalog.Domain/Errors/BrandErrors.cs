using SharedKernel;

namespace Catalog.Domain.Errors;
public static class BrandErrors
{
    public static Error NotFound(int brandId) => Error.NotFound(
        "CatalogBrands.NotFound",
        $"The catalog brand with Id = '{brandId}' was not found.");

    public static Error CannotDeleteWithItems(int brandId) => Error.Conflict(
        "CatalogBrands.CannotDeleteWithItems",
        $"The catalog brand with Id = '{brandId}' cannot be deleted because it has associated catalog items.");

    public static readonly Error NameAlreadyExists = Error.Conflict(
        "CatalogBrands.NameAlreadyExists",
        "Brand with the same name already exists.");

}