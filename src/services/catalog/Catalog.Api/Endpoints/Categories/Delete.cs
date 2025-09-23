using Catalog.Api.Auth;
using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Categories.Delete;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Categories;

internal sealed class Delete : IEndpoint
{
    public const string Name = "DeleteCategory";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(ApiEndpoints.Categories.Delete, async (
            [FromRoute] int id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new DeleteCategoryCommand { Id = id };
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(Results.NoContent, CustomResults.Problem);
        })
        .WithTags(Tags.Categories)
        .WithName(Name)
        .WithSummary("Deletes a category")
        .WithDescription("Deletes a category by its identifier.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}