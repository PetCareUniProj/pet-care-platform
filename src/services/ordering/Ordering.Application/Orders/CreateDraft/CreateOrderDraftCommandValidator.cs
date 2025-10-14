using FluentValidation;

namespace Ordering.Application.Orders.CreateDraft;
internal sealed class CreateOrderDraftCommandValidator : AbstractValidator<CreateOrderDraftCommand>
{
    public CreateOrderDraftCommandValidator()
    {
        RuleFor(x => x.BuyerId)
            .NotEmpty();
        RuleFor(x => x.BuyerName)
            .NotEmpty()
            .MaximumLength(100);
        RuleFor(x => x.BuyerEmail)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);
    }
}
