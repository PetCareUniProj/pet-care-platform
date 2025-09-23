namespace Catalog.Application.Categories.Get;
public sealed record GetCategoriesQuery : PagedSortingOptions, IQuery<Result<CategoriesResponse>>
{
    public string? Name { get; init; }
}