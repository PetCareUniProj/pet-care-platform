namespace Catalog.Application.Brands.Delete;
public sealed class DeleteBrandCommand : ICommand<Result>
{
    public int Id { get; init; }
}