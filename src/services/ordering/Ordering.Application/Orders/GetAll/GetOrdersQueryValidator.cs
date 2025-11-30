using FluentValidation;

namespace Ordering.Application.Orders.GetAll;

internal sealed class GetOrdersQueryValidator : AbstractValidator<GetOrdersQuery>
{
    private static readonly string[] AcceptableSortFields =
{
        "orderDate", "orderStatus"
    };
    public GetOrdersQueryValidator()
    {
        RuleFor(x => x.SortField)
            .Must(x => x is null || AcceptableSortFields.Contains(x, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"You can only sort by {string.Join(", ", AcceptableSortFields)}");

        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 25)
            .WithMessage("You can get between 1 and 25 orders per page");

        RuleForEach(x => x.Statuses)
            .IsInEnum()
            .WithMessage("Invalid order status.");
    }
}

