using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Auth;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Orders;
using Ordering.Application.Orders.GetAll;
using Ordering.Domain.Orders;

namespace Ordering.Api.Endpoints.Orders;

internal sealed class GetAllOrders : IEndpoint
{
    public const string Name = "GetAllOrders";

    public sealed record GetAllOrdersRequest : PagedRequest
    {
        public string? SortBy { get; init; }
        public OrderStatus[]? Statuses { get; init; }
        public bool? IsRecurring { get; init; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Orders.GetAll,
            async (
                [AsParameters] GetAllOrdersRequest request,
                IMediator mediator,
                CancellationToken cancellationToken) =>
            {
                var query = new GetOrdersQuery
                {
                    SortField = request.SortBy?.Trim('+', '-'),
                    SortOrder = request.SortBy is null ? SortOrder.Unsorted :
                        request.SortBy.StartsWith('-') ? SortOrder.Descending : SortOrder.Ascending,
                    Page = request.Page.GetValueOrDefault(PagedRequest.DefaultPage),
                    PageSize = request.PageSize.GetValueOrDefault(PagedRequest.DefaultPageSize),
                    Statuses = request.Statuses,
                    IsRecurring = request.IsRecurring
                };

                var orders = await mediator.Send(query, cancellationToken);
                return orders.Match(
                    orders => Results.Ok(orders),
                    CustomResults.Problem);
            })
        .WithName(Name)
        .WithTags(Tags.Orders)
        .WithSummary("Get All Orders")
        .WithDescription("Gets all orders with optional filters for admin users.")
        .Produces<OrdersResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization(AuthConstants.AdminUserPolicyName);
    }
}