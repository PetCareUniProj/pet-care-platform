using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Auth;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Orders.Ship;

namespace Ordering.Api.Endpoints.Orders;

public class Ship : IEndpoint
{
    public const string Name = "ShipOrder";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPatch(ApiEndpoints.Orders.Ship, async ([FromRoute] int id,
            IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new ShipOrderCommand
            {
                OrderId = id
            };
            var result = await mediator.Send(command, cancellationToken);
            return result.Match(
                () => Results.Ok(),
                CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Orders)
        .WithSummary("Ship an order")
        .WithDescription("This endpoint allows you to ship an order by its ID.")
        .Produces(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}
