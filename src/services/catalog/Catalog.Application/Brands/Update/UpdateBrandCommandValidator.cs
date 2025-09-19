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
                .WithErrorCode(CatalogBrandErrors.NameIsRequired.Code)
                .WithMessage(CatalogBrandErrors.NameIsRequired.Description)
            .MaximumLength(255)
                .WithErrorCode(CatalogBrandErrors.NameTooLong.Code)
                .WithMessage(CatalogBrandErrors.NameTooLong.Description);
    }
}
