using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Errors;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Items.Delete;

internal sealed class DeleteItemCommandHandler : ICommandHandler<DeleteItemCommand, Result>
{
    private readonly IApplicationDbContext _dbContext;

    public DeleteItemCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result> Handle(DeleteItemCommand command, CancellationToken cancellationToken)
    {
        var item = await _dbContext.Items.SingleOrDefaultAsync(i => i.Id == command.Id, cancellationToken);
        if (item is null)
        {
            return Result.Failure(ItemErrors.NotFound(command.Id));
        }

        _dbContext.Items.Remove(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}