
using Catalog.Api.Auth;
using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Items;
using Catalog.Application.Items.Update;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Items;

internal sealed class Update : IEndpoint
{
    public const string Name = "UpdateItem";
    public sealed record UpdateItemRequest
    {
        public required string Slug { get; init; }
        public required string Name { get; init; }
        public string? Description { get; init; }
        public decimal Price { get; init; }
        public string? PictureFileName { get; init; }
        public required int CatalogBrandId { get; init; }
        public int AvailableStock { get; init; }
        public int RestockThreshold { get; init; }
        public int MaxStockThreshold { get; init; }
        public bool OnReorder { get; init; }
        public required IReadOnlyCollection<int> CategoryIds { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(ApiEndpoints.Items.Update, async (
            [FromRoute] int id,
            UpdateItemRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var command = new UpdateItemCommand
            {
                Id = id,
                Slug = request.Slug,
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                PictureFileName = request.PictureFileName,
                CatalogBrandId = request.CatalogBrandId,
                AvailableStock = request.AvailableStock,
                RestockThreshold = request.RestockThreshold,
                MaxStockThreshold = request.MaxStockThreshold,
                OnReorder = request.OnReorder,
                CategoryIds = request.CategoryIds
            };
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(item => Results.Ok(item), CustomResults.Problem);
        })
        .WithTags(Tags.Items)
        .WithName(Name)
        .WithSummary("Updates an existing item")
        .WithDescription("Updates the details of an existing item by its identifier.")
        .Produces<ItemResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}
