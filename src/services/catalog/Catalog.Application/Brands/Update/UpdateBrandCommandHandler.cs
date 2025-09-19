using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Brands.Update;

internal sealed class UpdateBrandCommandHandler : ICommandHandler<UpdateBrandCommand, Result<BrandResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public UpdateBrandCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<BrandResponse>> Handle(UpdateBrandCommand command, CancellationToken cancellationToken)
    {
        var brand = await _dbContext.CatalogBrands
            .FirstOrDefaultAsync(b => b.Id == command.Id, cancellationToken);

        if (brand is null)
        {
            return Result.Failure<BrandResponse>(BrandErrors.NotFound(command.Id));
        }

        var nameExists = await _dbContext.CatalogBrands
            .AnyAsync(b => b.Name == command.NewName && b.Id != command.Id, cancellationToken);

        if (nameExists)
        {
            return Result.Failure<BrandResponse>(BrandErrors.NameAlreadyExists);
        }

        brand.Name = command.NewName;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new BrandResponse
        {
            Id = brand.Id,
            Name = brand.Name
        };

        return Result.Success(response);
    }
}