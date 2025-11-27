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
        .WithSummary("Ship an Subscription")
        .WithDescription("This endpoint allows you to ship an Subscription by its ID.")
        .Produces(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}


