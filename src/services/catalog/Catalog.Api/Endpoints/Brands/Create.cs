using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Brands;
using Catalog.Application.Brands.Create;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Brands;

internal sealed class Create : IEndpoint
{
    public const string Name = "CreateBrand";
    public sealed class CreateBrandRequest
    {
        public required string Name { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiEndpoints.Brands.Create, async (
            CreateBrandRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new CreateBrandCommand { Name = request.Name };
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(
                brand => Results.CreatedAtRoute(GetById.Name, new { id = brand.Id }, brand),
                CustomResults.Problem);
        })
        .WithTags(Tags.Brands)
        .WithName(Name)
        .WithSummary("Creates a new brand")
        .WithDescription("Creates a new brand with the specified name.")
        .Produces<BrandResponse>(StatusCodes.Status201Created)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status409Conflict);

    }
}
