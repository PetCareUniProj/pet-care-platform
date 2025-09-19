using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Brands.Delete;
internal sealed class DeleteBrandCommandHandler : ICommandHandler<DeleteBrandCommand, Result>
{
    private readonly IApplicationDbContext _dbContext;

    public DeleteBrandCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result> Handle(DeleteBrandCommand command, CancellationToken cancellationToken)
    {
        var brand = await _dbContext.Brands.SingleOrDefaultAsync(b => b.Id == command.Id, cancellationToken);

        if (brand == null)
        {
            return Result.Failure(BrandErrors.NotFound(command.Id));
        }

        var hasItems = await _dbContext.Items.AnyAsync(i => i.CatalogBrandId == command.Id, cancellationToken);
        if (hasItems)
        {
            return Result.Failure(BrandErrors.CannotDeleteWithItems(command.Id));
        }

        _dbContext.Brands.Remove(brand);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}