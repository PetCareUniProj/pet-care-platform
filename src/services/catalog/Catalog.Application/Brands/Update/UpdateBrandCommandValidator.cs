using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using FluentValidation;

namespace Catalog.Application.Brands.Update;

internal sealed class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator(IApplicationDbContext dbContext)
    {
        RuleFor(x => x.NewName)
            .NotEmpty()
                .WithErrorCode(BrandErrors.NameIsRequired.Code)
                .WithMessage(BrandErrors.NameIsRequired.Description)
            .MaximumLength(255)
                .WithErrorCode(BrandErrors.NameTooLong.Code)
                .WithMessage(BrandErrors.NameTooLong.Description);
    }
}
