
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Abstractions.Authentication;
using Ordering.Application.Orders;
using Ordering.Application.Orders.GetByUser;
using Ordering.Domain.Orders;

namespace Ordering.Api.Endpoints.Orders;

internal sealed class GetOrdersByUser : IEndpoint
{
    public const string Name = "GetOrdersByUser";

    public sealed record GetOrdersByUserRequest : PagedRequest
    {
        public string? SortBy { get; init; }
        public OrderStatus[]? Statuses { get; init; }
        public bool? IsRecurring { get; init; }
    }
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Orders.GetByUser,
            async (
                [AsParameters] GetOrdersByUserRequest request,
                IIdentityService identityService,
                IMediator mediator,
                CancellationToken cancellationToken) =>
            {
                var userId = identityService.GetUserIdentity();
                if (userId == Guid.Empty)
                {
                    return Results.Unauthorized();
                }

                var query = new GetOrdersByUserQuery
                {
                    UserId = userId,
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
        .WithSummary("Get Orders for the Authenticated User")
        .WithDescription("Gets all orders for the authenticated user.")
        .Produces<OrdersResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();

    }
}
