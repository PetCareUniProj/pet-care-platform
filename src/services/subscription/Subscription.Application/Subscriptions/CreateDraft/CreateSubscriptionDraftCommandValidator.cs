using FluentValidation;
using Subscription.Application.Models;

namespace Subscription.Application.Subscriptions.CreateDraft;

internal sealed class CreateSubscriptionDraftCommandValidator : AbstractValidator<CreateSubscriptionDraftCommand>
{
    //REVIEW: need model review
    public CreateSubscriptionDraftCommandValidator()
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
        RuleFor(x => x.Items)
            .NotEmpty();

        RuleForEach(x => x.Items)
            .SetValidator(new BasketItemValidator());

        RuleFor(x => x.RecurrenceInterval)
            .GreaterThan(TimeSpan.Zero)
            .When(x => x.IsRecurring)
            .WithMessage("Recurrence interval must be greater than zero for recurring Subscriptions.");
    }
}

internal sealed class BasketItemValidator : AbstractValidator<BasketItem>
{
    public BasketItemValidator()
    {

        RuleFor(x => x.ProductId)
            .GreaterThan(0);

        RuleFor(x => x.ProductName)
            .NotEmpty();

        RuleFor(x => x.UnitPrice)
            .GreaterThan(0);

        RuleFor(x => x.OldUnitPrice)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.Quantity)
            .GreaterThan(0);

        RuleFor(x => x.PictureUrl)
            .NotEmpty();
    }

    private static bool BeAValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var result)
               && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}

