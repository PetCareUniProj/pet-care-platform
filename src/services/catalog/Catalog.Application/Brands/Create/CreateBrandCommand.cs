namespace Catalog.Application.Brands.Create;
public sealed record CreateBrandCommand : ICommand<Result<BrandResponse>>
{
    public required string Name { get; init; }
}