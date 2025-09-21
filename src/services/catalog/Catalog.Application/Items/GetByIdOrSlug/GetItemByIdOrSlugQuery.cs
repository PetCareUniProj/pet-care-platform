namespace Catalog.Application.Items.GetByIdOrSlug;
public sealed class GetItemByIdOrSlugQuery : IQuery<Result<ItemResponse>>
{
    public string? IdOrSlug { get; set; }
}