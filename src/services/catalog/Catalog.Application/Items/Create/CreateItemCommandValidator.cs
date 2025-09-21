using FluentValidation;

namespace Catalog.Application.Items.Create;

internal sealed class CreateItemCommandValidator : AbstractValidator<CreateItemCommand>
{
    public CreateItemCommandValidator()
    {
        RuleFor(x => x.Slug)
            .NotEmpty()
            .MaximumLength(50)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug must be lowercase, contain only alphanumeric characters and hyphens, and cannot start or end with a hyphen");

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Price)
            .GreaterThan(0)
            .WithMessage("Price must be greater than zero");

        RuleFor(x => x.AvailableStock)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Available stock cannot be negative");

        RuleFor(x => x.RestockThreshold)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Restock threshold cannot be negative");

        RuleFor(x => x.MaxStockThreshold)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Max stock threshold cannot be negative");

        RuleFor(x => x)
            .Must(x => x.MaxStockThreshold >= x.RestockThreshold)
            .WithMessage("Max stock threshold must be greater than or equal to restock threshold")
            .When(x => x.MaxStockThreshold > 0 && x.RestockThreshold > 0);

        RuleFor(x => x.CategoryIds)
            .NotNull()
            .Must(ids => ids.Count > 0)
            .WithMessage("At least one category must be specified");
    }
}