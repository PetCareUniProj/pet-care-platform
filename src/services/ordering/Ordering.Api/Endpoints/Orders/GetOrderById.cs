
namespace Ordering.Api.Endpoints.Orders;

internal sealed class GetOrderById : IEndpoint
{
    public const string Name = "GetOrderById";
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(ApiEndpoints.Orders.GetById, () => Results.Ok())
            .WithName(Name)
            .WithTags(Tags.Orders)
            .WithDescription("Gets an order by Id.")
            .RequireAuthorization();
    }
}
