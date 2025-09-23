using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Categories;
using Catalog.Application.Categories.GetById;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Categories;

internal sealed class GetById : IEndpoint
{
    public const string Name = "GetCategoryById";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Categories.Get, async (
            [FromRoute] int id,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var query = new GetCategoryByIdQuery { Id = id };
            var result = await mediator.Send(query, cancellationToken);

            return result.Match(category => Results.Ok(category), CustomResults.Problem);
        })
        .WithTags(Tags.Categories)
        .WithName(Name)
        .WithSummary("Gets a category by its identifier")
        .WithDescription("Retrieves a single category by its unique identifier.")
        .Produces<CategoryResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .AllowAnonymous();
    }
}