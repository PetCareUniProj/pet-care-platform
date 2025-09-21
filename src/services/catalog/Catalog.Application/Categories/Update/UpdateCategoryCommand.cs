namespace Catalog.Application.Categories.Update;
public sealed class UpdateCategoryCommand : ICommand<Result<CategoryResponse>>
{
    public required int Id { get; init; }
    public required string NewName { get; init; }
}