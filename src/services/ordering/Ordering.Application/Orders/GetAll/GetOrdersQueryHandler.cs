using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.GetAll;

internal sealed class GetOrdersQueryHandler(IApplicationDbContext dbContext) : IQueryHandler<GetOrdersQuery, Result<OrdersResponse>>
{
    public async ValueTask<Result<OrdersResponse>> Handle(GetOrdersQuery query, CancellationToken cancellationToken)
    {
        IQueryable<Order> ordersQuery = dbContext.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .Include(o => o.Buyer)
            .Include(o => o.Address);

        if (query.Statuses is not null && query.Statuses.Any())
        {
            ordersQuery = ordersQuery.Where(o => query.Statuses.Contains(o.OrderStatus));
        }

        if (query.IsRecurring.HasValue)
        {
            ordersQuery = ordersQuery.Where(o => o.IsRecurring == query.IsRecurring.Value);
        }

        var pageSize = query.PageSize > 0 ? query.PageSize : 20;
        var pageOffset = (query.Page > 0 ? query.Page - 1 : 0) * pageSize;

        var totalCount = await ordersQuery.CountAsync(cancellationToken);

        var orders = await ordersQuery
            .Skip(pageOffset)
            .Take(pageSize)
            .Select(o => new OrderResponse
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                OrderStatus = o.OrderStatus.ToString(),
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
                OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
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
                ParentOrderId = o.ParentOrderId,
                IsDraft = o.OrderStatus == OrderStatus.Draft
            })
            .ToListAsync(cancellationToken);

        if (!orders.Any())
        {
            return Result.Failure<OrdersResponse>(OrderingErrors.Order.NotFoundForUser);
        }

        var response = new OrdersResponse
        {
            Items = orders,
            Total = totalCount,
            Page = query.Page,
            PageSize = pageSize
        };

        return Result.Success(response);
    }
}