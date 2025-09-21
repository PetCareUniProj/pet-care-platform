using Catalog.Application.Abstractions.Data;
using FluentValidation;

namespace Catalog.Application.Categories.Update;

internal sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator(IApplicationDbContext dbContext)
    {
        RuleFor(x => x.NewName)
            .NotEmpty()
            .MaximumLength(255);
    }
}