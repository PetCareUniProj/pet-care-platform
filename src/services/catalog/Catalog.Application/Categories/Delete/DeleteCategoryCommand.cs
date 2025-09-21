namespace Catalog.Application.Categories.Delete;
public sealed class DeleteCategoryCommand : ICommand<Result>
{
    public int Id { get; init; }
}