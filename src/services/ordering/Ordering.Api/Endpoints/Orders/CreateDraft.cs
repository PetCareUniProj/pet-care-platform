
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Abstractions.Authentication;
using Ordering.Application.Models;
using Ordering.Application.Orders;
using Ordering.Application.Orders.CreateDraft;

namespace Ordering.Api.Endpoints.Orders;

internal sealed class CreateDraft : IEndpoint
{
    public const string Name = "CreateOrderDraft";
    public record CreateOrderDraftRequest
    {
        public IEnumerable<BasketItem> Items { get; init; } = [];
    }
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiEndpoints.Orders.CreateDraft, async (CreateOrderDraftRequest request, IIdentityService identity, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var createOrderCommand = new CreateOrderDraftCommand
            {
                BuyerId = identity.GetUserIdentity(),
                BuyerEmail = identity.GetEmail()!,
                BuyerName = identity.GetFirstName()!,
                Items = request.Items
            };
            var result = await mediator.Send(createOrderCommand, cancellationToken);
            return result.Match(
             order => Results.CreatedAtRoute(GetOrderById.Name, new { id = order.Id }, order),
            CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Orders)
        .WithDescription("Creates a new order draft.")
        .Produces<OrderDraftResponse>(StatusCodes.Status201Created)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();

    }
}
