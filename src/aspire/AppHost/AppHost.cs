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

redis.WithParentRelationship(basketApi);

var _ = builder.AddProject<Catalog_Api>("catalog-api")
    .WithReference(catalogDb)
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WaitFor(keycloak).WithEnvironment("Identity__Url", identityEndpoint);

builder.Build().Run();
