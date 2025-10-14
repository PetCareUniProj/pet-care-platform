using Ordering.Application.Buyers.Create;

namespace Ordering.Application.DomainEventHandlers;
internal sealed class AddBuyerWhenOrderDraftedDomainEvent(IMediator mediator) : IDomainEventHandler<OrderDraftedDomainEvent>
{
    public async Task Handle(OrderDraftedDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var command = new CreateBuyerCommand
        {
            Id = domainEvent.BuyerId,
            Name = domainEvent.BuyerName,
            Email = domainEvent.BuyerEmail
        };
        await mediator.Send(command, cancellationToken);
    }
}
