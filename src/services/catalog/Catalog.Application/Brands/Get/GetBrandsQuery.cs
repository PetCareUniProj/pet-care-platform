namespace Catalog.Application.Brands.Get;
public sealed class GetBrandsQuery : PagedSortingOptions, IQuery<Result<BrandsResponse>>
{
    public string? Name { get; init; }
}