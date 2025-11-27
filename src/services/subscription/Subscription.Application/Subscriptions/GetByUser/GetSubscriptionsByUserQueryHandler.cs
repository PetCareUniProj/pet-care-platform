using Microsoft.EntityFrameworkCore;
using Subscription.Domain.Errors;

namespace Subscription.Application.Subscriptions.GetByUser;

internal sealed class GetSubscriptionsByUserQueryHandler(IApplicationDbContext dbContext) : IQueryHandler<GetSubscriptionsByUserQuery, Result<SubscriptionsResponse>>
{
    public async ValueTask<Result<SubscriptionsResponse>> Handle(GetSubscriptionsByUserQuery query, CancellationToken cancellationToken)
    {
        IQueryable<SubscriptionAggregate> subscriptionsQuery = dbContext.Subscriptions
            .AsNoTracking()
            .Include(o => o.SubscriptionItems)
            .Include(o => o.Buyer)
            .Include(o => o.Address);

        subscriptionsQuery = subscriptionsQuery
            .Where(o => o.BuyerId == query.UserId);

        var pageSize = query.PageSize > 0 ? query.PageSize : 20;
        var pageOffset = (query.Page > 0 ? query.Page - 1 : 0) * pageSize;

        var totalCount = await subscriptionsQuery.CountAsync(cancellationToken);

        var subscriptions = await subscriptionsQuery
            .Skip(pageOffset)
            .Take(pageSize)
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
                IsDraft = o.SubscriptionStatus == SubscriptionStatus.Draft
            })
            .ToListAsync(cancellationToken);

        if (!subscriptions.Any())
        {
            return Result.Failure<SubscriptionsResponse>(SubscriptionErrors.Subscription.NotFoundForUser);
        }

        var response = new SubscriptionsResponse
        {
            Items = subscriptions,
            Total = totalCount,
            Page = query.Page,
            PageSize = pageSize
        };

        return Result.Success(response);
    }
}

