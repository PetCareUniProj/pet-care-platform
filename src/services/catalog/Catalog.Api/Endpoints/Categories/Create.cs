using Catalog.Api.Auth;
using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Categories;
using Catalog.Application.Categories.Create;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Categories;

internal sealed class Create : IEndpoint
{
    public const string Name = "CreateCategory";
    public sealed record CreateCategoryRequest
    {
        public required string Name { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(ApiEndpoints.Categories.Create, async (
            CreateCategoryRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new CreateCategoryCommand { Name = request.Name };
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(
                category => Results.CreatedAtRoute(GetById.Name, new { id = category.Id }, category),
                CustomResults.Problem);
        })
        .WithTags(Tags.Categories)
        .WithName(Name)
        .WithSummary("Creates a new category")
        .WithDescription("Creates a new category with the specified name.")
        .Produces<CategoryResponse>(StatusCodes.Status201Created)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}
