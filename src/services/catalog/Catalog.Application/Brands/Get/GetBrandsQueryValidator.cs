using FluentValidation;

namespace Catalog.Application.Brands.Get;
internal sealed class GetBrandsQueryValidator : AbstractValidator<GetBrandsQuery>
{
    private static readonly string[] AcceptableSortFields =
    {
        "name"
    };
    public GetBrandsQueryValidator()
    {
        RuleFor(x => x.Name).MaximumLength(100);

        RuleFor(x => x.SortField)
            .Must(x => x is null || AcceptableSortFields.Contains(x, StringComparer.OrdinalIgnoreCase))
            .WithMessage("You can only sort by 'name' ");

        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 25)
            .WithMessage("You can get between 1 and 25 brands per page");
    }
}