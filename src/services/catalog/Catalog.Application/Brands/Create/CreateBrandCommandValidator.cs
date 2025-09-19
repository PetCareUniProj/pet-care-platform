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
                .WithErrorCode(BrandErrors.NameIsRequired.Code)
                .WithMessage(BrandErrors.NameIsRequired.Description)
            .MaximumLength(255)
                .WithErrorCode(BrandErrors.NameTooLong.Code)
                .WithMessage(BrandErrors.NameTooLong.Description);
    }
}
