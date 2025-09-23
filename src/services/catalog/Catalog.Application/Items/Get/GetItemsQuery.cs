namespace Catalog.Application.Items.Get;

public sealed record GetItemsQuery : PagedSortingOptions, IQuery<Result<ItemsResponse>>
{
    public string? Name { get; init; }
    public int? BrandId { get; init; }
    public int? CategoryId { get; init; }
}