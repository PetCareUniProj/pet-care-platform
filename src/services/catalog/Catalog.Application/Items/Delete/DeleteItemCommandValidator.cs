using FluentValidation;

namespace Catalog.Application.Items.Delete;
internal sealed class DeleteItemCommandValidator : AbstractValidator<DeleteItemCommand>
{
    public DeleteItemCommandValidator()
    {
        RuleFor(x => x.Id).NotNull().GreaterThanOrEqualTo(1);

    }
}
