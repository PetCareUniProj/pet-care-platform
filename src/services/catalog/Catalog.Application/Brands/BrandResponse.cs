namespace Catalog.Application.Brands;
public sealed record BrandResponse
{
    public int Id { get; init; }
    public required string Name { get; init; }
}