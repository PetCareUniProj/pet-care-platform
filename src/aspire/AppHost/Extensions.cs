using Aspire.Hosting.Yarp;
using Aspire.Hosting.Yarp.Transforms;

namespace AppHost;

internal static class Extensions
{
    public static IResourceBuilder<YarpResource> ConfigureMobileBffRoutes(this IResourceBuilder<YarpResource> builder,
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
            yarp.AddRoute("/api/items", catalogCluster)
                ;
            yarp.AddRoute("/api/items/{idOrSlug}", catalogCluster)
                ;
            yarp.AddRoute("/api/items/{id:int}/pic", catalogCluster)
                ;

            // Brands endpoints
            yarp.AddRoute("/api/brand", catalogCluster)
                ;
            yarp.AddRoute("/api/brand/{id:int}", catalogCluster)
                ;

            // Categories endpoints
            yarp.AddRoute("/api/category", catalogCluster)
                ;
            yarp.AddRoute("/api/category/{id:int}", catalogCluster)
                ;

            // Generic catalog catch-all route
            yarp.AddRoute("/api/{*any}", catalogCluster)
                ;

            // Ordering endpoints (через кластер)
            yarp.AddRoute("/api/orders", orderingCluster)
                ;
            yarp.AddRoute("/api/orders/draft", orderingCluster)
                ;
            yarp.AddRoute("/api/orders/cancel/{id:int}", orderingCluster)
                ;
            yarp.AddRoute("/api/orders/ship/{id:int}", orderingCluster)
                ;
            yarp.AddRoute("/api/orders/cardtypes", orderingCluster)
                ;
            yarp.AddRoute("/api/orders/{id:int}", orderingCluster)
                ;
            yarp.AddRoute("/api/orders/user/me", orderingCluster)
                ;
            yarp.AddRoute("/api/orders/user/{userId:guid}", orderingCluster)
                ;

            // Basket gRPC endpoints
            yarp.AddRoute("/basket.Basket/{*grpcMethod}", basketCluster);

            // Identity routes
            yarp.AddRoute("/identity/{*any}", keycloak.GetEndpoint("http"))
                .WithTransformPathRemovePrefix("/identity");
        });
    }
}
