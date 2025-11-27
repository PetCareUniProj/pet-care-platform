using Microsoft.EntityFrameworkCore;
using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.Create;

internal sealed class CreateSubscriptionCommandHandler(IApplicationDbContext dbContext, ISubscriptionIntegrationEventService SubscriptionIntegrationEventService) : ICommandHandler<CreateSubscriptionCommand, Result<SubscriptionResponse>>
{
    public async ValueTask<Result<SubscriptionResponse>> Handle(CreateSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var draftSubscription = await dbContext.Subscriptions
            .Include(o => o.SubscriptionItems)
            .SingleOrDefaultAsync(
                o => o.Id == command.DraftSubscriptionId && o.SubscriptionStatus == SubscriptionStatus.Draft,
                cancellationToken);

        if (draftSubscription is null)
        {
            return Result.Failure<SubscriptionResponse>(SubscriptionErrors.Subscription.NotFound(command.DraftSubscriptionId));
        }

        if (draftSubscription.BuyerId != command.BuyerId)
        {
            return Result.Failure<SubscriptionResponse>(SubscriptionErrors.Subscription.NotFound(command.DraftSubscriptionId));
        }

        var SubscriptionStartedIntegrationEvent = new SubscriptionStartedIntegrationEvent(command.BuyerId);
        await SubscriptionIntegrationEventService.AddAndSaveEventAsync(SubscriptionStartedIntegrationEvent);

        Address address;
        var addressResult = Address.Create(command.Street, command.City, command.State, command.Country, command.ZipCode);
        if (addressResult.IsFailure)
        {
            return Result.Failure<SubscriptionResponse>(addressResult.Error);
        }

        address = addressResult.Value;

        // Update the draft Subscription with creation info
        var updateResult = draftSubscription.UpdateFromDraft(
            address,
            command.CardTypeId,
            command.CardNumber ?? string.Empty,
            command.CardSecurityNumber ?? string.Empty,
            command.CardHolderName ?? string.Empty,
            command.CardExpiration,
            command.BuyerId,
            command.PaymentMethodId);

        if (updateResult.IsFailure)
        {
            return Result.Failure<SubscriptionResponse>(updateResult.Error);
        }

        if (draftSubscription.IsRecurring)
        {
            var recurrenceResult = draftSubscription.ScheduleRecurrence(draftSubscription.RecurrenceInterval);
            if (recurrenceResult.IsFailure)
            {
                return Result.Failure<SubscriptionResponse>(recurrenceResult.Error);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        var SubscriptionResponse = new SubscriptionResponse
        {
            Id = draftSubscription.Id,
            SubscriptionDate = draftSubscription.SubscriptionDate,
            SubscriptionStatus = draftSubscription.SubscriptionStatus.ToString(),
            Description = draftSubscription.Description, // Ensure this is populated if needed
            BuyerId = draftSubscription.BuyerId,
            Address = new AddressDTO
            {
                Street = draftSubscription.Address.Street,
                City = draftSubscription.Address.City,
                State = draftSubscription.Address.State,
                Country = draftSubscription.Address.Country,
                ZipCode = draftSubscription.Address.ZipCode
            },
            SubscriptionItems = draftSubscription.SubscriptionItems.Select(oi => new SubscriptionItemDTO
            {
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                UnitPrice = oi.UnitPrice,
                Discount = oi.Discount,
                Units = oi.Units,
                PictureUrl = oi.PictureUrl
            }).ToList(),
            Total = draftSubscription.GetTotal(),
            PaymentId = draftSubscription.PaymentId,
            IsRecurring = draftSubscription.IsRecurring,
            RecurrenceInterval = draftSubscription.RecurrenceInterval,
            NextRecurrenceDate = draftSubscription.NextRecurrenceDate,
            ParentSubscriptionId = draftSubscription.ParentSubscriptionId,
            IsDraft = draftSubscription.IsDraft
        };
        return Result.Success(SubscriptionResponse);
    }
}

