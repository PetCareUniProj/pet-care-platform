using FluentValidation;

namespace Catalog.Application.Brands.Delete;
internal sealed class DeleteBrandCommandValidator : AbstractValidator<DeleteBrandCommand>
{
    public DeleteBrandCommandValidator()
    {
        RuleFor(x => x.Id).NotNull().GreaterThanOrEqualTo(1);
    }
}
