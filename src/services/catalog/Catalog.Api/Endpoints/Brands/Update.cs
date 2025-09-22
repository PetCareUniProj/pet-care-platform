using Catalog.Api.Auth;
using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Brands;
using Catalog.Application.Brands.Update;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Brands;
internal sealed class Update : IEndpoint
{
    public const string Name = "UpdateBrand";
    public sealed class UpdateBrandRequest
    {
        public required string NewName { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(ApiEndpoints.Brands.Update, async (
            [FromRoute] int id,
            UpdateBrandRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var command = new UpdateBrandCommand
            {
                Id = id,
                NewName = request.NewName
            };
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(brand => Results.Ok(brand), CustomResults.Problem);
        })
        .WithTags(Tags.Brands)
        .WithName(Name)
        .WithSummary("Updates an existing brand")
        .WithDescription("Updates the name of an existing brand by its identifier.")
        .Produces<BrandResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}