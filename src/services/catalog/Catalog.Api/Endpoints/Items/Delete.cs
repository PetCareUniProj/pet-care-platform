
using Catalog.Api.Auth;
using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Items.Delete;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Items;

internal sealed class Delete : IEndpoint
{
    public const string Name = "DeleteItem";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(ApiEndpoints.Items.Delete, async (
            [FromRoute] int id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new DeleteItemCommand { Id = id };
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(Results.NoContent, CustomResults.Problem);
        })
        .WithTags(Tags.Items)
        .WithName(Name)
        .WithSummary("Deletes an item")
        .WithDescription("Deletes an item by its identifier.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}