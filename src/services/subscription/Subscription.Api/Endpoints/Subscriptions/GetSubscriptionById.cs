
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Subscription.Api.Extensions;
using Subscription.Api.Infrastructure;
using Subscription.Application.Abstractions.Authentication;
using Subscription.Application.Subscriptions.GetById;

namespace Subscription.Api.Endpoints.Subscriptions;

internal sealed class GetSubscriptionById : IEndpoint
{
    public const string Name = "GetSubscriptionById";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Subscriptions.GetById,
        async ([FromRoute] int id, IMediator mediator, IIdentityService identityService, CancellationToken cancellationToken) =>
        {
            var userIdentity = identityService.GetUserIdentity();
            var isAdmin = identityService.IsAdmin();
            var query = new GetSubscriptionByIdQuery { SubscriptionId = id, UserId = userIdentity, IsAdmin = isAdmin };
            var result = await mediator.Send(query, cancellationToken);
            return result.Match(Subscription => Results.Ok(Subscription), CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Subscriptions)
        .WithDescription("Gets an Subscription by Id.")
        .RequireAuthorization();
    }
}


