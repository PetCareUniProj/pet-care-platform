using Subscription.Application.Extensions;

namespace Subscription.Application.Subscriptions.CreateDraft;

internal sealed class CreateSubscriptionDraftCommandHandler(IApplicationDbContext dbContext) : ICommandHandler<CreateSubscriptionDraftCommand, Result<SubscriptionDraftResponse>>
{
    public async ValueTask<Result<SubscriptionDraftResponse>> Handle(CreateSubscriptionDraftCommand command, CancellationToken cancellationToken)
    {
        var subscriptionCreationResult = command.IsRecurring
            ? SubscriptionAggregate.CreateRecurringDraft(command.BuyerId, command.BuyerName, command.BuyerEmail, command.RecurrenceInterval!.Value)
            : SubscriptionAggregate.NewDraft(command.BuyerId, command.BuyerName, command.BuyerEmail);

        if (subscriptionCreationResult.IsFailure)
        {
            return Result.Failure<SubscriptionDraftResponse>(subscriptionCreationResult.Error);
        }

        var subscription = subscriptionCreationResult.Value;
        var subscriptionItems = command.Items.Select(i => i.ToSubscriptionItemDTO());
        foreach (var item in subscriptionItems)
        {
            subscription.AddSubscriptionItem(item.ProductId, item.ProductName, item.UnitPrice, item.Discount, item.PictureUrl, item.Units);
        }

        var subscriptionAdded = await dbContext.Subscriptions.AddAsync(subscription, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(SubscriptionDraftResponse.FromSubscription(subscriptionAdded.Entity));
    }
}


