using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Categories;
using Catalog.Application.Categories.Get;
using Mediator;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Catalog.Api.Endpoints.Categories;

internal sealed class Get : IEndpoint
{
    public const string Name = "GetCategories";
    public sealed record GetCategoriesRequest : PagedRequest
    {
        public string? Name { get; init; }
        public string? SortBy { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Categories.GetAll, async (
            [AsParameters] GetCategoriesRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var query = new GetCategoriesQuery
            {
                Name = request.Name,
                SortField = request.SortBy?.Trim('+', '-'),
                SortOrder = request.SortBy is null ? SortOrder.Unsorted :
                request.SortBy.StartsWith('-') ? SortOrder.Descending : SortOrder.Ascending,
                Page = request.Page.GetValueOrDefault(PagedRequest.DefaultPage),
                PageSize = request.PageSize.GetValueOrDefault(PagedRequest.DefaultPageSize)
            };
            var result = await mediator.Send(query, cancellationToken);

            return result.Match(categories => Results.Ok(categories), CustomResults.Problem);
        })
        .WithTags(Tags.Categories)
        .WithName(Name)
        .WithSummary("Gets a paged, sorted list of categories")
        .WithDescription("Retrieves a paged and sorted list of categories. Supports filtering by name and sorting by any field using the 'SortBy' query parameter (prefix with '-' for descending order, no prefix for ascending). Paging is controlled with 'Page' and 'PageSize' parameters.")
        .Produces<CategoriesResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .AllowAnonymous();
    }
}