using Projects;

var builder = DistributedApplication.CreateBuilder(args);

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

var _ = builder.AddProject<Catalog_Api>("catalog-api")
    .WithReference(catalogDb)
    .WithEnvironment("Identity__Url", identityEndpoint)
    .WithReference(rabbitMq).WaitFor(rabbitMq)
    .WithReference(keycloak).WaitFor(keycloak);

builder.Build().Run();
