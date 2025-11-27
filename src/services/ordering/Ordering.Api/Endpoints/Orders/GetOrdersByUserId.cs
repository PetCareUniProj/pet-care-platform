using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Abstractions.Authentication;
using Ordering.Application.Orders;
using Ordering.Application.Orders.GetByUser;
using Ordering.Domain.Orders;
using static Ordering.Api.Endpoints.Orders.GetOrdersByUser;

namespace Ordering.Api.Endpoints.Orders;

internal sealed class GetOrdersByUserId : IEndpoint
{
    public sealed record GetOrdersByUserIdRequest : PagedRequest
    {
        public string? SortBy { get; init; }
        public OrderStatus[]? Statuses { get; init; }
        public bool? IsRecurring { get; init; }
    }
    public const string Name = "GetOrdersByUserId";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Orders.GetByUserId,
            async ([FromRoute] Guid userId, [AsParameters] GetOrdersByUserRequest request,
            IIdentityService identityService, IMediator mediator, CancellationToken cancellationToken) =>
        {
            if (userId == Guid.Empty)
            {
                return Results.BadRequest("Invalid user ID.");
            }

            var isAdmin = identityService.IsAdmin();
            var currentUserId = identityService.GetUserIdentity();
            if (!isAdmin && currentUserId != userId)
            {
                return Results.Forbid();
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
        .WithSummary("Get Orders by User ID")
        .WithDescription("Gets all orders for a specific user. Admins can access any user's orders; regular users can only access their own.")
        .Produces<OrdersResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status403Forbidden)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .RequireAuthorization();

    }
}
