
using Mediator;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Buyers.GetCardTypes;

namespace Ordering.Api.Endpoints.Orders;

internal sealed class GetCardTypes : IEndpoint
{
    public const string Name = "GetCardTypes";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Orders.GetCardTypes, async (IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new GetCardTypesQuery(), cancellationToken);
            return result.Match(Results.Ok, CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Orders)
        .WithDescription("Gets all available card types.")
        .Produces<List<CardTypeResponse>>(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}
