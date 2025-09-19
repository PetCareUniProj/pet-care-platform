namespace Catalog.Application.Brands.Update;
public sealed class UpdateBrandCommand : ICommand<Result<BrandResponse>>
{
    public required int Id { get; init; }
    public required string NewName { get; init; }
}
