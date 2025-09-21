
using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Items;
using Catalog.Application.Items.Create;
using Mediator;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Endpoints.Items;

internal sealed class Create : IEndpoint
{
    public const string Name = "CreateItem";
    public sealed record CreateItemRequest
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
        app.MapPost(ApiEndpoints.Items.Create, async (
            CreateItemRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new CreateItemCommand
            {
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

            return result.Match(
                item => Results.CreatedAtRoute(GetByIdOrSlug.Name, new { idOrSlug = item.Id }, item),
                CustomResults.Problem);
        })
        .WithTags(Tags.Items)
        .WithName(Name)
        .WithSummary("Creates a new item")
        .WithDescription("Creates a new item with the specified details.")
        .Produces<ItemResponse>(StatusCodes.Status201Created)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status409Conflict);
    }
}
