using SharedKernel;

namespace Catalog.Domain.Entities;
public static class CategoryErrors
{
    public static Error NotFound(int categoryId) => Error.NotFound(
        "CatalogCategories.NotFound",
        $"The catalog category with Id = '{categoryId}' was not found.");

    public static Error CannotDeleteWithItems(int categoryId) => Error.Conflict(
        "CatalogCategories.CannotDeleteWithItems",
        $"The catalog category with Id = '{categoryId}' cannot be deleted because it has associated catalog items.");

    public static readonly Error NameAlreadyExists = Error.Conflict(
        "CatalogCategories.NameAlreadyExists",
        "Category with the same name already exists.");
}