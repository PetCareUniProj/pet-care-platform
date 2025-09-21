namespace Catalog.Application.Categories.Create;
public sealed class CreateCategoryCommand : ICommand<Result<CategoryResponse>>
{
    public required string Name { get; init; }
}