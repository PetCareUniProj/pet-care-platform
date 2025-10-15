
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Abstractions.Authentication;
using Ordering.Application.Orders;
using Ordering.Application.Orders.Create;

namespace Ordering.Api.Endpoints.Orders;

internal sealed class Create : IEndpoint
{
    public const string Name = "CreateOrder";
    public sealed record CreateOrderRequest
    {
        public required int DraftOrderId { get; init; }
        public required string City { get; init; }
        public required string Street { get; init; }
        public required string State { get; init; }
        public required string Country { get; init; }
        public required string ZipCode { get; init; }
        public required string CardNumber { get; init; }
        public required string CardHolderName { get; init; }
        public DateTime CardExpiration { get; init; }
        public required string CardSecurityNumber { get; init; }
        public int CardTypeId { get; init; }
        public int PaymentMethodId { get; init; }
    }
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiEndpoints.Orders.Create, async (
            CreateOrderRequest request,
            IIdentityService identity,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var createOrderCommand = new CreateOrderCommand
            {
                BuyerId = identity.GetUserIdentity(),
                DraftOrderId = request.DraftOrderId,
                City = request.City,
                Street = request.Street,
                State = request.State,
                Country = request.Country,
                ZipCode = request.ZipCode,
                CardNumber = request.CardNumber,
                CardHolderName = request.CardHolderName,
                CardExpiration = request.CardExpiration,
                CardSecurityNumber = request.CardSecurityNumber,
                CardTypeId = request.CardTypeId,
                PaymentMethodId = request.PaymentMethodId
            };

            var result = await mediator.Send(createOrderCommand, cancellationToken);
            return result.Match(
                order => Results.CreatedAtRoute(GetOrderById.Name, new { id = request.DraftOrderId }, order),
                CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Orders)
        .WithDescription("Creates a new order from a draft order.")
        .Produces<OrderResponse>(StatusCodes.Status201Created)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
