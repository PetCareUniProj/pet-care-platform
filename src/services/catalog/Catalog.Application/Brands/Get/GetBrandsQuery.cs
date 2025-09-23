namespace Catalog.Application.Brands.Get;
public sealed record GetBrandsQuery : PagedSortingOptions, IQuery<Result<BrandsResponse>>
{
    public string? Name { get; init; }
}