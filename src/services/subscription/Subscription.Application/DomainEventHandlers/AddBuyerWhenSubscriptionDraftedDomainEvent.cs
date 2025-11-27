using Subscription.Application.Buyers.Create;

namespace Subscription.Application.DomainEventHandlers;
internal sealed class AddBuyerWhenSubscriptionDraftedDomainEvent(IMediator mediator) : IDomainEventHandler<SubscriptionDraftedDomainEvent>
{
    public async Task Handle(SubscriptionDraftedDomainEvent domainEvent, CancellationToken cancellationToken)
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


