
using Mediator;
using Subscription.Api.Extensions;
using Subscription.Api.Infrastructure;
using Subscription.Application.Buyers.GetCardTypes;

namespace Subscription.Api.Endpoints.Subscriptions;

internal sealed class GetCardTypes : IEndpoint
{
    public const string Name = "GetCardTypes";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Subscriptions.GetCardTypes, async (IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new GetCardTypesQuery(), cancellationToken);
            return result.Match(Results.Ok, CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Subscriptions)
        .WithDescription("Gets all available card types.")
        .Produces<List<CardTypeResponse>>(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}


