namespace Catalog.Application.Categories.GetById;
public sealed class GetCategoryByIdQuery : IQuery<Result<CategoryResponse>>
{
    public int Id { get; set; }
}