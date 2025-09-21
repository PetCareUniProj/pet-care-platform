using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Items;
using Catalog.Application.Items.Get;
using Mediator;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Catalog.Api.Endpoints.Items;
internal sealed class Get : IEndpoint
{
    public const string Name = "GetItems";
    public sealed class GetItemsRequest : PagedRequest
    {
        public string? Name { get; init; }
        public int? BrandId { get; init; }
        public int? CategoryId { get; init; }
        public string? SortBy { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Items.GetAll, async (
            [AsParameters] GetItemsRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var query = new GetItemsQuery
            {
                Name = request.Name,
                BrandId = request.BrandId,
                CategoryId = request.CategoryId,
                SortField = request.SortBy?.Trim('+', '-'),
                SortOrder = request.SortBy is null ? SortOrder.Unsorted :
                    request.SortBy.StartsWith('-') ? SortOrder.Descending : SortOrder.Ascending,
                Page = request.Page.GetValueOrDefault(PagedRequest.DefaultPage),
                PageSize = request.PageSize.GetValueOrDefault(PagedRequest.DefaultPageSize)
            };
            var result = await mediator.Send(query, cancellationToken);

            return result.Match(items => Results.Ok(items), CustomResults.Problem);
        })
        .WithTags(Tags.Items)
        .WithName(Name)
        .WithSummary("Gets a paged, sorted list of items")
        .WithDescription("Retrieves a paged and sorted list of items. Supports filtering by name, brand, and category, and sorting by any field using the 'SortBy' query parameter (prefix with '-' for descending order, no prefix for ascending). Paging is controlled with 'Page' and 'PageSize' parameters.")
        .Produces<ItemsResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);
    }
}
