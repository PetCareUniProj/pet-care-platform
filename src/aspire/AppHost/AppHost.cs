var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin()
    .WithLifetime(ContainerLifetime.Persistent);

var catalogDb = postgres.AddDatabase("catalogDb");

var keycloak = builder.AddKeycloak("keycloak", 8080)
    .WithDataVolume()
    .WithExternalHttpEndpoints()
    .WithLifetime(ContainerLifetime.Persistent);
builder.Build().Run();
