using FluentValidation;

namespace Catalog.Application.Items.Get;

internal sealed class GetItemsQueryValidator : AbstractValidator<GetItemsQuery>
{
    private static readonly string[] AcceptableSortFields =
    {
        "name",
        "price"
    };

    public GetItemsQueryValidator()
    {
        RuleFor(x => x.Name).MaximumLength(100);

        RuleFor(x => x.SortField)
            .Must(x => x is null || AcceptableSortFields.Contains(x, StringComparer.OrdinalIgnoreCase))
            .WithMessage("You can only sort by 'name' or 'price'");

        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 25)
            .WithMessage("You can get between 1 and 25 items per page");

        RuleFor(x => x.BrandId)
            .GreaterThan(0)
            .When(x => x.BrandId is not null);

        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .When(x => x.CategoryId is not null);
    }
}