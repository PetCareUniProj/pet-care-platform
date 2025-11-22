using Ordering.Application.Extensions;

namespace Ordering.Application.Orders.CreateDraft;

internal sealed class CreateOrderDraftCommandHandler(IApplicationDbContext dbContext) : ICommandHandler<CreateOrderDraftCommand, Result<OrderDraftResponse>>
{
    public async ValueTask<Result<OrderDraftResponse>> Handle(CreateOrderDraftCommand command, CancellationToken cancellationToken)
    {
        var orderCreationResult = command.IsRecurring
            ? Order.CreateRecurringDraft(command.BuyerId, command.BuyerName, command.BuyerEmail, command.RecurrenceInterval!.Value)
            : Order.NewDraft(command.BuyerId, command.BuyerName, command.BuyerEmail);

        if (orderCreationResult.IsFailure)
        {
            return Result.Failure<OrderDraftResponse>(orderCreationResult.Error);
        }

        var order = orderCreationResult.Value;
        var orderItems = command.Items.Select(i => i.ToOrderItemDTO());
        foreach (var item in orderItems)
        {
            order.AddOrderItem(item.ProductId, item.ProductName, item.UnitPrice, item.Discount, item.PictureUrl, item.Units);
        }

        var orderAdded = await dbContext.Orders.AddAsync(order, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(OrderDraftResponse.FromOrder(orderAdded.Entity));
    }
}
