using Mediator;
using Microsoft.AspNetCore.Mvc;
using Subscription.Api.Extensions;
using Subscription.Api.Infrastructure;
using Subscription.Application.Abstractions.Authentication;
using Subscription.Application.Subscriptions;
using Subscription.Application.Subscriptions.GetByUser;

namespace Subscription.Api.Endpoints.Subscriptions;

internal sealed class GetSubscriptionsByUserId : IEndpoint
{
    public const string Name = "GetSubscriptionsByUserId";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Subscriptions.GetByUserId,
            async ([FromRoute] Guid userId, IIdentityService identityService, IMediator mediator, CancellationToken cancellationToken) =>
        {
            if (userId == Guid.Empty)
            {
                return Results.BadRequest("Invalid user ID.");
            }

            var isAdmin = identityService.IsAdmin();
            var currentUserId = identityService.GetUserIdentity();
            if (!isAdmin && currentUserId != userId)
            {
                return Results.Forbid();
            }

            var Subscriptions = await mediator.Send(new GetSubscriptionsByUserQuery() { UserId = userId }, cancellationToken);

            return Subscriptions.Match(
                Subscriptions => Results.Ok(Subscriptions),
                CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Subscriptions)
        .WithSummary("Get Subscriptions by User ID")
        .WithDescription("Gets all Subscriptions for a specific user. Admins can access any user's Subscriptions; regular users can only access their own.")
        .Produces<SubscriptionsResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status403Forbidden)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .RequireAuthorization();

    }
}


