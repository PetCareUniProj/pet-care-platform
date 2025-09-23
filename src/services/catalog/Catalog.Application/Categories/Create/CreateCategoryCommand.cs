namespace Catalog.Application.Categories.Create;
public sealed record CreateCategoryCommand : ICommand<Result<CategoryResponse>>
{
    public required string Name { get; init; }
}