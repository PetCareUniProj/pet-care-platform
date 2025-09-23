namespace Catalog.Application.Items.GetByIdOrSlug;
public sealed record GetItemByIdOrSlugQuery : IQuery<Result<ItemResponse>>
{
    public string? IdOrSlug { get; set; }
}