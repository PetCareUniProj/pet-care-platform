using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Errors;

namespace Ordering.Application.Orders.Create;

internal sealed class CreateOrderCommandHandler(IApplicationDbContext dbContext, IOrderingIntegrationEventService orderingIntegrationEventService) : ICommandHandler<CreateOrderCommand, Result<OrderResponse>>
{
    public async ValueTask<Result<OrderResponse>> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var draftOrder = await dbContext.Orders
            .Include(o => o.OrderItems)
            .SingleOrDefaultAsync(
                o => o.Id == command.DraftOrderId && o.OrderStatus == OrderStatus.Draft,
                cancellationToken);

        if (draftOrder is null)
        {
            return Result.Failure<OrderResponse>(OrderingErrors.Order.NotFound(command.DraftOrderId));
        }

        if (draftOrder.BuyerId != command.BuyerId)
        {
            return Result.Failure<OrderResponse>(OrderingErrors.Order.NotFound(command.DraftOrderId));
        }

        var orderStartedIntegrationEvent = new OrderStartedIntegrationEvent(command.BuyerId);
        await orderingIntegrationEventService.AddAndSaveEventAsync(orderStartedIntegrationEvent);

        Address address;
        var addressResult = Address.Create(command.Street, command.City, command.State, command.Country, command.ZipCode);
        if (addressResult.IsFailure)
        {
            return Result.Failure<OrderResponse>(addressResult.Error);
        }

        address = addressResult.Value;

        // Update the draft order with creation info
        var updateResult = draftOrder.UpdateFromDraft(
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
            return Result.Failure<OrderResponse>(updateResult.Error);
        }

        if (draftOrder.IsRecurring)
        {
            var recurrenceResult = draftOrder.ScheduleRecurrence(draftOrder.RecurrenceInterval);
            if (recurrenceResult.IsFailure)
            {
                return Result.Failure<OrderResponse>(recurrenceResult.Error);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        var orderResponse = new OrderResponse
        {
            Id = draftOrder.Id,
            OrderDate = draftOrder.OrderDate,
            OrderStatus = draftOrder.OrderStatus.ToString(),
            Description = draftOrder.Description, // Ensure this is populated if needed
            BuyerId = draftOrder.BuyerId,
            Address = new AddressDTO
            {
                Street = draftOrder.Address.Street,
                City = draftOrder.Address.City,
                State = draftOrder.Address.State,
                Country = draftOrder.Address.Country,
                ZipCode = draftOrder.Address.ZipCode
            },
            OrderItems = draftOrder.OrderItems.Select(oi => new OrderItemDTO
            {
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                UnitPrice = oi.UnitPrice,
                Discount = oi.Discount,
                Units = oi.Units,
                PictureUrl = oi.PictureUrl
            }).ToList(),
            Total = draftOrder.GetTotal(),
            PaymentId = draftOrder.PaymentId,
            IsRecurring = draftOrder.IsRecurring,
            RecurrenceInterval = draftOrder.RecurrenceInterval,
            NextRecurrenceDate = draftOrder.NextRecurrenceDate,
            ParentOrderId = draftOrder.ParentOrderId,
            IsDraft = draftOrder.IsDraft
        };
        return Result.Success(orderResponse);
    }
}