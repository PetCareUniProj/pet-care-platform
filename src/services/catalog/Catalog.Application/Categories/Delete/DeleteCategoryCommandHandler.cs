using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Categories.Delete;
internal sealed class DeleteCategoryCommandHandler : ICommandHandler<DeleteCategoryCommand, Result>
{
    private readonly IApplicationDbContext _dbContext;

    public DeleteCategoryCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result> Handle(DeleteCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await _dbContext.Categories.SingleOrDefaultAsync(c => c.Id == command.Id, cancellationToken);
        if (category == null)
        {
            return Result.Failure(CategoryErrors.NotFound(command.Id));
        }

        var hasItems = await _dbContext.Items
            .Where(i => i.Categories.Any(c => c.Id == command.Id))
            .AnyAsync(cancellationToken);
        if (hasItems)
        {
            return Result.Failure(CategoryErrors.CannotDeleteWithItems(command.Id));
        }

        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}