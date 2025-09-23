using Catalog.Application.Abstractions.Data;
using Catalog.Infrastructure.Database;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.Keycloak;
using Testcontainers.PostgreSql;

namespace Catalog.Api.Tests.Integrational;

public class CatalogApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgresContainer = new PostgreSqlBuilder()
    .WithDatabase("testdb")
    .WithUsername("testuser")
    .WithPassword("testpassword")
    .Build();

    private readonly KeycloakContainer _keycloakContainer = new KeycloakBuilder()
        .WithImage("quay.io/keycloak/keycloak:26.2")
        .WithResourceMapping("./pet-care-platform-realm.json", "/opt/keycloak/data/import")
        .WithCommand("--import-realm")
        .Build();

    public string ConnectionString => _postgresContainer.GetConnectionString();
    public string KeycloakBaseUrl => _keycloakContainer.GetBaseAddress();

    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        await _keycloakContainer.StartAsync();
    }

    public new async Task DisposeAsync()
    {
        await _postgresContainer.DisposeAsync();
        await _keycloakContainer.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Environment.SetEnvironmentVariable("Identity__Url", KeycloakBaseUrl);
        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

            if (descriptor is not null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ApplicationDbContext>(
                options => options
                    .UseNpgsql(ConnectionString)
                    .UseSnakeCaseNamingConvention());

            services.TryAddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        });
    }
}