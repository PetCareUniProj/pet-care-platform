using Catalog.Api.Extensions;
using Catalog.Api.Infrastructure;
using Catalog.Application.Brands;
using Catalog.Application.Brands.Get;
using Mediator;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Catalog.Api.Endpoints.Brands;

internal sealed class Get : IEndpoint
{
    public const string Name = "GetBrands";
    public sealed class GetBrandRequest : PagedRequest
    {
        public string? Name { get; init; }
        public string? SortBy { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Brands.GetAll, async (
            [AsParameters] GetBrandRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var query = new GetBrandsQuery
            {
                Name = request.Name,
                SortField = request.SortBy?.Trim('+', '-'),
                SortOrder = request.SortBy is null ? SortOrder.Unsorted :
                request.SortBy.StartsWith('-') ? SortOrder.Descending : SortOrder.Ascending,
                Page = request.Page.GetValueOrDefault(PagedRequest.DefaultPage),
                PageSize = request.PageSize.GetValueOrDefault(PagedRequest.DefaultPageSize)
            };
            var result = await mediator.Send(query, cancellationToken);

            return result.Match(brands => Results.Ok(brands), CustomResults.Problem);
        })
        .WithTags(Tags.Brands)
        .WithName(Name)
        .WithSummary("Gets a paged, sorted list of brands")
        .WithDescription("Retrieves a paged and sorted list of brands. Supports filtering by name and sorting by any field using the 'SortBy' query parameter (prefix with '-' for descending order, no prefix for ascending). Paging is controlled with 'Page' and 'PageSize' parameters.")
        .Produces<BrandsResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .AllowAnonymous();
    }
}