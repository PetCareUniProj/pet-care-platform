using FluentValidation;

namespace Catalog.Application.Categories.Create;
internal sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{

    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(255);
    }
}