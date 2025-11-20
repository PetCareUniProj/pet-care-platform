
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Abstractions.Authentication;
using Ordering.Application.Orders.Cancel;

namespace Ordering.Api.Endpoints.Orders;

public class Cancel : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiEndpoints.Orders.Cancel, async ([FromRoute] int id,
            IMediator mediator, IIdentityService identityService, CancellationToken cancellationToken) =>
        {
            var identity = identityService.GetUserIdentity();
            var isAdmin = identityService.IsAdmin();
            var command = new CancelOrderCommand
            {
                OrderId = id,
                Identity = identity,
                IsAdmin = isAdmin
            };
            var result = await mediator.Send(command, cancellationToken);
            return result.Match(
                Results.NoContent,
                CustomResults.Problem);
        })
        .WithName("CancelOrder")
        .WithTags(Tags.Orders)
        .WithDescription("Cancels an existing order.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
