using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using Catalog.Domain.Errors;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.Categories.Create;
internal sealed class CreateCategoryCommandHandler : ICommandHandler<CreateCategoryCommand, Result<CategoryResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public CreateCategoryCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async ValueTask<Result<CategoryResponse>> Handle(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        var exists = await _dbContext.Categories
            .AnyAsync(b => b.Name == command.Name, cancellationToken);

        if (exists)
        {
            return Result.Failure<CategoryResponse>(CategoryErrors.NameAlreadyExists);
        }

        var category = new Category
        {
            Name = command.Name
        };
        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name
        };

        return response;
    }
}