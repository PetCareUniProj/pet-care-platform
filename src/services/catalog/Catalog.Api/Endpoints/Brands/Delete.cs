using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Brands.Delete;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Brands;

internal sealed class Delete : IEndpoint
{
    public const string Name = "DeleteBrand";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(ApiEndpoints.Brands.Delete, async (
            [FromRoute] int id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new DeleteBrandCommand { Id = id };
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(Results.NoContent, CustomResults.Problem);
        })
        .WithTags(Tags.Brands)
        .WithName(Name)
        .WithSummary("Deletes a brand")
        .WithDescription("Deletes a brand by its identifier.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);
    }
}