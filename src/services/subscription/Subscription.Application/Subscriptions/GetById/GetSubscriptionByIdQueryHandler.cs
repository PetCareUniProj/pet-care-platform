using Microsoft.EntityFrameworkCore;
using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.GetById;
internal sealed class GetSubscriptionByIdQueryHandler
    (IApplicationDbContext dbContext)
    : IQueryHandler<GetSubscriptionByIdQuery, Result<SubscriptionResponse>>
{
    public async ValueTask<Result<SubscriptionResponse>> Handle(GetSubscriptionByIdQuery query, CancellationToken cancellationToken)
    {
        var SubscriptionQuery = dbContext.Subscriptions
            .AsNoTracking()
            .AsSplitQuery()
            .Include(o => o.SubscriptionItems)
            .Include(o => o.Address)
            .Where(o => o.Id == query.SubscriptionId);

        if (!query.IsAdmin)
        {
            SubscriptionQuery = SubscriptionQuery.Where(o => o.BuyerId == query.UserId);
        }

        var SubscriptionResponse = await SubscriptionQuery
            .Select(o => new SubscriptionResponse
            {
                Id = o.Id,
                SubscriptionDate = o.SubscriptionDate,
                SubscriptionStatus = o.SubscriptionStatus.ToString(),
                Description = o.Description,
                BuyerId = o.BuyerId,
                Address = new AddressDTO
                {
                    Street = o.Address.Street,
                    City = o.Address.City,
                    State = o.Address.State,
                    Country = o.Address.Country,
                    ZipCode = o.Address.ZipCode
                },
                SubscriptionItems = o.SubscriptionItems.Select(oi => new SubscriptionItemDTO
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.ProductName,
                    UnitPrice = oi.UnitPrice,
                    Discount = oi.Discount,
                    Units = oi.Units,
                    PictureUrl = oi.PictureUrl
                }).ToList(),
                Total = o.GetTotal(),
                PaymentId = o.PaymentId,
                IsRecurring = o.IsRecurring,
                RecurrenceInterval = o.RecurrenceInterval,
                NextRecurrenceDate = o.NextRecurrenceDate,
                ParentSubscriptionId = o.ParentSubscriptionId,
                IsDraft = o.IsDraft
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (SubscriptionResponse is null)
        {
            return Result.Failure<SubscriptionResponse>(SubscriptionErrors.Subscription.NotFound(query.SubscriptionId));
        }

        return Result.Success(SubscriptionResponse);

    }
}


