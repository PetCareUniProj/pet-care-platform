
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Abstractions.Authentication;
using Ordering.Application.Orders;
using Ordering.Application.Orders.GetByUser;

namespace Ordering.Api.Endpoints.Orders;

internal sealed class GetOrdersByUser : IEndpoint
{
    public const string Name = "GetOrdersByUser";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Orders.GetByUser,
            async (IIdentityService identityService, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var userId = identityService.GetUserIdentity();
            if (userId == Guid.Empty)
            {
                return Results.Unauthorized();
            }

            var orders = await mediator.Send(new GetOrdersByUserQuery() { UserId = userId }, cancellationToken);
            return orders.Match(
            orders => Results.Ok(orders),
            CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Orders)
        .WithSummary("Get Orders for the Authenticated User")
        .WithDescription("Gets all orders for the authenticated user.")
        .Produces<OrdersResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();

    }
}
