using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Brands;
using Catalog.Application.Brands.GetById;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Brands;

internal sealed class GetById : IEndpoint
{
    public const string Name = "GetBrandById";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Brands.Get, async (
            [FromRoute] int id,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var query = new GetBrandByIdQuery { Id = id };
            var result = await mediator.Send(query, cancellationToken);

            return result.Match(brand => Results.Ok(brand), CustomResults.Problem);
        })
        .WithTags(Tags.Brands)
        .WithName(Name)
        .WithSummary("Gets a brand by its identifier")
        .WithDescription("Retrieves a single brand by its unique identifier.")
        .Produces<BrandResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);
    }
}