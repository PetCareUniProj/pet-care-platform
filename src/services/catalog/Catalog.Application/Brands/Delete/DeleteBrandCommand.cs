namespace Catalog.Application.Brands.Delete;
public sealed record DeleteBrandCommand : ICommand<Result>
{
    public int Id { get; init; }
}