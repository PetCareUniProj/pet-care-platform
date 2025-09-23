namespace Catalog.Application.Categories.GetById;
public sealed record GetCategoryByIdQuery : IQuery<Result<CategoryResponse>>
{
    public int Id { get; set; }
}