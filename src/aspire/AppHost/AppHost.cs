using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres", port: 5432)
    .WithDataVolume()
    .WithPgAdmin()
    .WithLifetime(ContainerLifetime.Persistent);

var catalogDb = postgres.AddDatabase("catalogDb");

var keycloak = builder.AddKeycloak("keycloak", 8080)
    .WithDataVolume()
    .WithExternalHttpEndpoints()
    .WithLifetime(ContainerLifetime.Persistent);

var _ = builder.AddProject<Catalog_Api>("catalog-api")
    .WithReference(catalogDb)
    .WithReference(keycloak)
    .WaitFor(keycloak);

builder.Build().Run();
