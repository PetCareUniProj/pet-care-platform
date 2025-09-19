using Catalog.Application.Abstractions.Data;
using Catalog.Domain.Entities;
using FluentValidation;

namespace Catalog.Application.Brands.Create;
internal sealed class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
{

    public CreateBrandCommandValidator(IApplicationDbContext dbContext)
    {
        RuleFor(x => x.Name)
            .NotEmpty()
                .WithErrorCode(CatalogBrandErrors.NameIsRequired.Code)
                .WithMessage(CatalogBrandErrors.NameIsRequired.Description)
            .MaximumLength(255)
                .WithErrorCode(CatalogBrandErrors.NameTooLong.Code)
                .WithMessage(CatalogBrandErrors.NameTooLong.Description);
    }
}
