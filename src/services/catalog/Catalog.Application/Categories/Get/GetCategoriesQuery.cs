namespace Catalog.Application.Categories.Get;
public sealed class GetCategoriesQuery : PagedSortingOptions, IQuery<Result<CategoriesResponse>>
{
    public string? Name { get; init; }
}