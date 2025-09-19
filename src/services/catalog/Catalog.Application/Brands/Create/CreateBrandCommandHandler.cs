using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Brands.Create;
internal sealed class CreateBrandCommandHandler : ICommandHandler<CreateBrandCommand, Result<BrandResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public CreateBrandCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<BrandResponse>> Handle(CreateBrandCommand command, CancellationToken cancellationToken)
    {
        var exists = await _dbContext.CatalogBrands
            .AnyAsync(b => b.Name == command.Name, cancellationToken);

        if (exists)
        {
            return Result.Failure<BrandResponse>(CatalogBrandErrors.NameAlreadyExists);
        }

        var brand = new CatalogBrand { Name = command.Name };
        _dbContext.CatalogBrands.Add(brand);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new BrandResponse
        {
            Id = brand.Id,
            Name = brand.Name
        };

        return response;
    }
}
