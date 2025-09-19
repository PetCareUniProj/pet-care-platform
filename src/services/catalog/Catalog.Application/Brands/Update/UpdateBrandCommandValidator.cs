using Catalog.Application.Abstractions.Data;
using FluentValidation;

namespace Catalog.Application.Brands.Update;

internal sealed class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator(IApplicationDbContext dbContext)
    {
        RuleFor(x => x.NewName)
            .NotEmpty()
            .MaximumLength(255);
    }
}