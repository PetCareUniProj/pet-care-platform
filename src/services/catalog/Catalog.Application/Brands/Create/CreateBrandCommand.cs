namespace Catalog.Application.Brands.Create;
public sealed class CreateBrandCommand : ICommand<Result<BrandResponse>>
{
    public required string Name { get; init; }
}