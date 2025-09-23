using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Errors;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Categories.Update;

internal sealed class UpdateCategoryCommandHandler : ICommandHandler<UpdateCategoryCommand, Result<CategoryResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public UpdateCategoryCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<CategoryResponse>> Handle(UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await _dbContext.Categories
            .FirstOrDefaultAsync(b => b.Id == command.Id, cancellationToken);

        if (category is null)
        {
            return Result.Failure<CategoryResponse>(CategoryErrors.NotFound(command.Id));
        }

        var nameExists = await _dbContext.Categories
            .AnyAsync(b => b.Name == command.NewName && b.Id != command.Id, cancellationToken);

        if (nameExists)
        {
            return Result.Failure<CategoryResponse>(CategoryErrors.NameAlreadyExists);
        }

        category.Name = command.NewName;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name
        };

        return Result.Success(response);
    }
}