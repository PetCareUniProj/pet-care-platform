
using Mediator;
using Microsoft.AspNetCore.Mvc;
using Ordering.Api.Extensions;
using Ordering.Api.Infrastructure;
using Ordering.Application.Abstractions.Authentication;
using Ordering.Application.Orders.GetById;

namespace Ordering.Api.Endpoints.Orders;

internal sealed class GetOrderById : IEndpoint
{
    public const string Name = "GetOrderById";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Orders.GetById,
        async ([FromRoute] int id, IMediator mediator, IIdentityService identityService, CancellationToken cancellationToken) =>
        {
            var userIdentity = identityService.GetUserIdentity();
            var isAdmin = identityService.IsAdmin();
            var query = new GetOrderByIdQuery { OrderId = id, UserId = userIdentity, IsAdmin = isAdmin };
            var result = await mediator.Send(query, cancellationToken);
            return result.Match(order => Results.Ok(order), CustomResults.Problem);
        })
        .WithName(Name)
        .WithTags(Tags.Orders)
        .WithDescription("Gets an order by Id.")
        .RequireAuthorization();
    }
}
