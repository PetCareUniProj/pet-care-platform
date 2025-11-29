namespace Ordering.Application.Orders.SetAwaitingValidationStatus;

public record SetAwaitingValidationOrderStatusCommand : ICommand<Result>
{
    public int OrderId { get; init; }
}
