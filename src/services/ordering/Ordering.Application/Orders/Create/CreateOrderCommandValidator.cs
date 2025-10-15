using FluentValidation;

namespace Ordering.Application.Orders.Create;
internal sealed class CreateOrderCommandValidator
    : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.BuyerId)
            .NotEmpty();

        RuleFor(x => x.DraftOrderId)
            .GreaterThan(0);

        RuleFor(x => x.City)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Street)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.State)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Country)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.ZipCode)
            .NotEmpty()
            .MaximumLength(18);

        RuleFor(x => x.CardNumber)
            .NotEmpty()
            .CreditCard()
            .MaximumLength(25);

        RuleFor(x => x.CardHolderName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.CardExpiration)
            .GreaterThan(DateTime.UtcNow);

        RuleFor(x => x.CardSecurityNumber)
            .NotEmpty()
            .MaximumLength(7);

        RuleFor(x => x.CardTypeId)
            .GreaterThan(0)
            .LessThanOrEqualTo(3);
    }
}
