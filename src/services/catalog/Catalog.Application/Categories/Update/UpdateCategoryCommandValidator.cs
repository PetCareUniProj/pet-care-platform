using FluentValidation;

namespace Catalog.Application.Categories.Update;

internal sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.NewName)
            .NotEmpty()
            .MaximumLength(100);
    }
}