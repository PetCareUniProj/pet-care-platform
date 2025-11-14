using FluentValidation;

namespace Ordering.Application.Orders;
internal sealed class OrderItemDTOValidator : AbstractValidator<OrderItemDTO>
{
    public OrderItemDTOValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0);

        RuleFor(x => x.ProductName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.Discount)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.Units)
            .GreaterThan(0);
    }
}