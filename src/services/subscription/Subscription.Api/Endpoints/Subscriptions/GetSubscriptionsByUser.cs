
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Subscription.Api.Extensions;
using Subscription.Api.Infrastructure;
using Subscription.Application.Abstractions.Authentication;
using Subscription.Application.Subscriptions;
using Subscription.Application.Subscriptions.GetByUser;

namespace Subscription.Api.Endpoints.Subscriptions;

internal sealed class GetSubscriptionsByUser : IEndpoint
{
    public const string Name = "GetSubscriptionsByUser";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Subscriptions.GetByUser,
            async (IIdentityService identityService, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var userId = identityService.GetUserIdentity();
            if (userId == Guid.Empty)
            {
                return Results.Unauthorized();
            }

            var Subscriptions = await mediator.Send(new GetSubscriptionsByUserQuery() { UserId = userId }, cancellationToken);
            return Subscriptions.Match(
            Subscriptions => Results.Ok(Subscriptions),
            CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Subscriptions)
        .WithSummary("Get Subscriptions for the Authenticated User")
        .WithDescription("Gets all Subscriptions for the authenticated user.")
        .Produces<SubscriptionsResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();

    }
}


