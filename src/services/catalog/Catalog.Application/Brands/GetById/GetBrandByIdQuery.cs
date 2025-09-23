namespace Catalog.Application.Brands.GetById;
public sealed record GetBrandByIdQuery : IQuery<Result<BrandResponse>>
{
    public int Id { get; init; }
}