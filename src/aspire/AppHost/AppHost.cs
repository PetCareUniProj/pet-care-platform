using Projects;
using Scalar.Aspire;

var builder = DistributedApplication.CreateBuilder(args);
var redis = builder.AddRedis("redis");
var rabbitMq = builder.AddRabbitMQ("eventbus")
    .WithLifetime(ContainerLifetime.Persistent);

var postgres = builder.AddPostgres("postgres", port: 5432)
    .WithDataVolume()
    .WithPgAdmin()
    .WithLifetime(ContainerLifetime.Persistent);

var catalogDb = postgres.AddDatabase("catalogDb");
var orderDb = postgres.AddDatabase("orderingDb");
var subscriptionDb = postgres.AddDatabase("subscriptionDb");

var keycloak = builder.AddKeycloak("keycloak", 8080)
    .WithDataVolume()
    .WithExternalHttpEndpoints()
    .WithRealmImport("./realms")
    .WithLifetime(ContainerLifetime.Persistent);

var identityEndpoint = keycloak.GetEndpoint("http");

var basketApi = builder.AddProject<Basket_Api>("basket-api")
    .WithReference(redis).WaitFor(redis)
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

var orderingApi = builder.AddProject<Ordering_Api>("ordering-api")
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WithReference(orderDb).WaitFor(orderDb)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

builder.AddProject<OrderProcessor>("orderprocessor")
        .WithReference(orderDb).WaitFor(orderDb)
        .WithReference(rabbitMq).WaitFor(rabbitMq);

builder.AddProject<PaymentProcessor>("paymentprocessor")
    .WithReference(rabbitMq).WaitFor(rabbitMq);

builder.AddNpmApp("subscription-api", "../../services/subscription", "start:dev")
    .WithNpmPackageInstallation()
    .WithHttpEndpoint(env: "PORT")
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WithReference(subscriptionDb).WaitFor(subscriptionDb)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

var catalogApi = builder.AddProject<Catalog_Api>("catalog-api")
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WithReference(catalogDb).WaitFor(catalogDb)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

builder.AddNpmApp("store-web", "../../store", "start:dev")
    .WithNpmPackageInstallation()
    .WithHttpEndpoint(env: "PORT")
    .WithReference(orderingApi).WaitFor(orderingApi)
    .WithReference(basketApi).WaitFor(basketApi)
    .WithReference(catalogApi).WaitFor(catalogApi)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

// Add Scalar API Reference with debugging enabled
var scalar = builder.AddScalarApiReference(options =>
{
    options.WithTheme(ScalarTheme.Saturn);

    options
        .PreferHttpsEndpoint() // Use HTTPS endpoints when available
        .AllowSelfSignedCertificates(); // Trust self-signed certificates

    options.AddPreferredSecuritySchemes("oauth2")
            .AddAuthorizationCodeFlow("oauth2", flow =>
            {
                flow.WithClientId("public-client-web");
                flow.WithSelectedScopes("openid", "profile");
            });

})
.WithReference(keycloak)
.WithExternalHttpEndpoints();

scalar.WithApiReference(catalogApi, options =>
{
    options
        .AddDocument("v1", "Catalog API v1")
        .WithOpenApiRoutePattern("/openapi/{documentName}.json");
});
scalar.WithApiReference(orderingApi, options =>
{
    options
        .AddDocument("v1", "Ordering API v1")
        .WithOpenApiRoutePattern("/openapi/{documentName}.json");
});

builder.Build().Run();
