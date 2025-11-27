using Mediator;
using Microsoft.AspNetCore.Mvc;
using Subscription.Api.Auth;
using Subscription.Api.Extensions;
using Subscription.Api.Infrastructure;
using Subscription.Application.Subscriptions.Ship;

namespace Subscription.Api.Endpoints.Subscriptions;

public class Ship : IEndpoint
{
    public const string Name = "ShipSubscription";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPatch(ApiEndpoints.Subscriptions.Ship, async ([FromRoute] int id,
            IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new ShipSubscriptionCommand
            {
                SubscriptionId = id
            };
            var result = await mediator.Send(command, cancellationToken);
            return result.Match(
                () => Results.Ok(),
                CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Subscriptions)
        .WithSummary("Ship a subscription")
        .WithDescription("Ships a subscription by its identifier. Only administrators can invoke this operation.")
        .Produces(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}


