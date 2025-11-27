using FluentValidation;

namespace Subscription.Application.Subscriptions;
internal sealed class SubscriptionItemDTOValidator : AbstractValidator<SubscriptionItemDTO>
{
    public SubscriptionItemDTOValidator()
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

