using Projects;

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

var orderingApi = builder.AddNpmApp("ordering-api", "../../services/ordering", "start:dev")
    .WithNpmPackageInstallation()
    .WithHttpEndpoint(env: "PORT")
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WithReference(orderDb).WaitFor(orderDb)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

builder.AddNpmApp("subscription-api", "../../services/subscription", "start:dev")
    .WithNpmPackageInstallation()
    .WithHttpEndpoint(env: "PORT")
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WithReference(subscriptionDb).WaitFor(subscriptionDb)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

var catalogApi = builder.AddProject<Catalog_Api>("catalog-api")
    .WithReference(catalogDb)
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

builder.AddNpmApp("store-web", "../../store", "start:dev")
    .WithNpmPackageInstallation()
    .WithHttpEndpoint(env: "PORT")
    .WithReference(orderingApi).WaitFor(orderingApi)
    .WithReference(basketApi).WaitFor(basketApi)
    .WithReference(catalogApi).WaitFor(catalogApi)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

builder.Build().Run();
