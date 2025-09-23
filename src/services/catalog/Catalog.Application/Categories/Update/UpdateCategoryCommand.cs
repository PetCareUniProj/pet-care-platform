namespace Catalog.Application.Categories.Update;
public sealed record UpdateCategoryCommand : ICommand<Result<CategoryResponse>>
{
    public required int Id { get; init; }
    public required string NewName { get; init; }
}