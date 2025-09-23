using FluentValidation;

namespace Catalog.Application.Categories.Delete;
internal sealed class DeleteCategoryCommandValidator : AbstractValidator<DeleteCategoryCommand>
{
    public DeleteCategoryCommandValidator()
    {
        RuleFor(x => x.Id).NotNull().GreaterThanOrEqualTo(1);
    }
}