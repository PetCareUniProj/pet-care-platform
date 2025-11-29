using Aspire.Hosting.Yarp;
using Aspire.Hosting.Yarp.Transforms;

namespace AppHost;

internal static class Extensions
{
    public static IResourceBuilder<YarpResource> ConfigureMobileBffRoutes(
        this IResourceBuilder<YarpResource> builder,
        IResourceBuilder<ProjectResource> catalogApi,
        IResourceBuilder<ProjectResource> orderingApi,
        IResourceBuilder<ProjectResource> basketApi,
        IResourceBuilder<KeycloakResource> keycloak)
    {
        return builder.WithConfiguration(yarp =>
        {
            var catalogCluster = yarp.AddCluster(catalogApi);
            var basketCluster = yarp.AddCluster(basketApi);
            var orderingCluster = yarp.AddCluster(orderingApi);

            // Items endpoints
            yarp.AddRoute("/api/catalog/items", catalogCluster);
            yarp.AddRoute("/api/catalog/items/{idOrSlug}", catalogCluster);
            yarp.AddRoute("/api/catalog/items/{id:int}/pic", catalogCluster);

            // Brands endpoints
            yarp.AddRoute("/api/catalog/brand", catalogCluster);
            yarp.AddRoute("/api/catalog/brand/{id:int}", catalogCluster);

            // Categories endpoints
            yarp.AddRoute("/api/catalog/category", catalogCluster);
            yarp.AddRoute("/api/catalog/category/{id:int}", catalogCluster);

            // Generic catalog catch-all route
            yarp.AddRoute("/api/catalog/{*any}", catalogCluster);

            // Ordering endpoints
            yarp.AddRoute("/api/orders", orderingCluster);
            yarp.AddRoute("/api/orders/draft", orderingCluster);
            yarp.AddRoute("/api/orders/cancel/{id:int}", orderingCluster);
            yarp.AddRoute("/api/orders/ship/{id:int}", orderingCluster);
            yarp.AddRoute("/api/orders/cardtypes", orderingCluster);
            yarp.AddRoute("/api/orders/{id:int}", orderingCluster);
            yarp.AddRoute("/api/orders/user/me", orderingCluster);
            yarp.AddRoute("/api/orders/user/{userId:guid}", orderingCluster);

            // Basket gRPC endpoints
            yarp.AddRoute("/basket.Basket/{*grpcMethod}", basketCluster);

            // Identity routes
            yarp.AddRoute("/identity/{*any}", keycloak.GetEndpoint("http"))
                .WithTransformPathRemovePrefix("/identity");
        });
    }
}
