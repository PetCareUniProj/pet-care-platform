namespace Catalog.Application.Brands.GetById;
public sealed class GetBrandByIdQuery : IQuery<Result<BrandResponse>>
{
    public int Id { get; set; }
}
