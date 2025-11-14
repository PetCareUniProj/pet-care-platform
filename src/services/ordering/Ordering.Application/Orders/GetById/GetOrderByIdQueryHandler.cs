using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.GetById;
internal sealed class GetOrderByIdQueryHandler
    (IApplicationDbContext dbContext)
    : IQueryHandler<GetOrderByIdQuery, Result<OrderResponse>>
{
    public async ValueTask<Result<OrderResponse>> Handle(GetOrderByIdQuery query, CancellationToken cancellationToken)
    {
        var orderQuery = dbContext.Orders
            .AsNoTracking()
            .AsSplitQuery()
            .Include(o => o.OrderItems)
            .Include(o => o.Address)
            .Where(o => o.Id == query.OrderId);

        if (!query.IsAdmin)
        {
            orderQuery = orderQuery.Where(o => o.BuyerId == query.UserId);
        }

        var orderResponse = await orderQuery
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
                IsDraft = o.IsDraft
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (orderResponse is null)
        {
            return Result.Failure<OrderResponse>(OrderingErrors.Order.NotFound(query.OrderId));
        }

        return Result.Success(orderResponse);

    }
}
