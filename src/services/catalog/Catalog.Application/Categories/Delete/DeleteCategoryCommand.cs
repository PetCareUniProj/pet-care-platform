namespace Catalog.Application.Categories.Delete;
public sealed record DeleteCategoryCommand : ICommand<Result>
{
    public int Id { get; init; }
}