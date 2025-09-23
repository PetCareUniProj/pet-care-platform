using Catalog.Api.Auth;
using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Categories;
using Catalog.Application.Categories.Update;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Categories;
internal sealed class Update : IEndpoint
{
    public const string Name = "UpdateCategory";
    public sealed record UpdateCategoryRequest
    {
        public required string NewName { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(ApiEndpoints.Categories.Update, async (
            [FromRoute] int id,
            UpdateCategoryRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var command = new UpdateCategoryCommand
            {
                Id = id,
                NewName = request.NewName
            };
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(category => Results.Ok(category), CustomResults.Problem);
        })
        .WithTags(Tags.Categories)
        .WithName(Name)
        .WithSummary("Updates an existing category")
        .WithDescription("Updates the name of an existing category by its identifier.")
        .Produces<CategoryResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}