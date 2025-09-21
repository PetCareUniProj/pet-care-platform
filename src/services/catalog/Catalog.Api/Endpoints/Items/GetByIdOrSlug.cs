
using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Items;
using Catalog.Application.Items.GetByIdOrSlug;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Items;

internal sealed class GetByIdOrSlug : IEndpoint
{
    public const string Name = "GetItemById";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Items.Get, async (
            [FromRoute] string idOrSlug,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var query = new GetItemByIdOrSlugQuery { IdOrSlug = idOrSlug };
            var result = await mediator.Send(query, cancellationToken);

            return result.Match(item => Results.Ok(item), CustomResults.Problem);
        })
        .WithTags(Tags.Items)
        .WithName(Name)
        .WithSummary("Gets an item by its identifier or slug")
        .WithDescription("Retrieves a single item by its unique identifier or slug.")
        .Produces<ItemResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);
    }
}
