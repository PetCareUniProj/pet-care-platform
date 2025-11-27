
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Subscription.Api.Extensions;
using Subscription.Api.Infrastructure;
using Subscription.Application.Abstractions.Authentication;
using Subscription.Application.Subscriptions.Cancel;

namespace Subscription.Api.Endpoints.Subscriptions;

public class Cancel : IEndpoint
{
    public const string Name = "CancelSubscription";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiEndpoints.Subscriptions.Cancel, async ([FromRoute] int id,
            IMediator mediator, IIdentityService identityService, CancellationToken cancellationToken) =>
        {
            var identity = identityService.GetUserIdentity();
            var isAdmin = identityService.IsAdmin();
            var command = new CancelSubscriptionCommand
            {
                SubscriptionId = id,
                Identity = identity,
                IsAdmin = isAdmin
            };
            var result = await mediator.Send(command, cancellationToken);
            return result.Match(
                Results.NoContent,
                CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Subscriptions)
        .WithSummary("Cancel a subscription")
        .WithDescription("Cancels an existing Subscription.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}


